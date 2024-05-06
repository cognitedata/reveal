/*!
 * Copyright 2024 Cognite AS
 */
import {
  type Cognite3DViewer,
  type Image360,
  type Image360Annotation,
  type Image360AnnotationAppearance,
  type Image360Collection,
  type Image360EnteredDelegate,
  type Image360Revision
} from '@cognite/reveal';
import {
  type AddOptionsWithModel,
  type Image360AddOptionsWithModel,
  type Image360AnnotationStyleGroup
} from './ResourceUpdater';
import {
  type DefaultResourceStyling,
  type Image360AssetStylingGroup,
  type InstanceStylingGroup
} from './types';
import { type AnnotationsCogniteAnnotationTypesImagesAssetLink } from '@cognite/sdk';
import { is360ImageCollectionOptions } from '../../utilities/isSameModel';
import { isImage360AssetStylingGroup } from '../../utilities/StylingGroupUtils';

type CollectionStyleGroupWithAssetSet = {
  styling: Image360AnnotationAppearance;
  assetIdSet: Set<number>;
};

export class Image360StylingHandler {
  private readonly _collections: Image360AddOptionsWithModel[];
  private _defaultStyling: DefaultResourceStyling['image360'] = undefined;
  private _instanceStyling: Image360AssetStylingGroup[] = [];
  private readonly _viewer: Cognite3DViewer;

  private readonly _previousImage360StylingCallbacks = new Map<
    string,
    (image: Image360, imageRevision: Image360Revision) => void
  >();

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._collections = [];
  }

  public setCommonStyling(
    defaultStyling: DefaultResourceStyling['image360'],
    instanceStyling: InstanceStylingGroup[]
  ): void {
    this._defaultStyling = defaultStyling;
    this._instanceStyling = instanceStyling.filter(isImage360AssetStylingGroup);
  }

  async setCollections(models: AddOptionsWithModel[]): Promise<void> {
    const collections = models.filter((model): model is Image360AddOptionsWithModel =>
      is360ImageCollectionOptions(model.addOptions)
    );

    this._collections.push(...collections);
  }

  public async update360ImageStylingCallback(collection: Image360Collection): Promise<void> {
    const collectionId = collection.id;
    const prevCallback = this._previousImage360StylingCallbacks.get(collectionId);
    if (prevCallback !== undefined) {
      collection.off('image360Entered', prevCallback);
    }

    const styleGroups = this.compute360ImageStyleGroups();
    const collectionStyleGroupsWithSet = styleGroups.map((group) => ({
      styling: group.style,
      assetIdSet: new Set(group.assetIds)
    }));

    const defaultStyling = this._defaultStyling?.default;

    const onEnteredStylingCallback: Image360EnteredDelegate = async (_image, imageRevision) => {
      const annotations = await imageRevision.getAnnotations();
      annotations.forEach((annotation) => {
        styleAnnotation(annotation, defaultStyling, collectionStyleGroupsWithSet);
      });
    };

    collection.on('image360Entered', onEnteredStylingCallback);
    this._previousImage360StylingCallbacks.set(collectionId, onEnteredStylingCallback);

    this.styleCurrentlyEntered360Image(onEnteredStylingCallback);
  }

  private styleCurrentlyEntered360Image(stylingCallback: Image360EnteredDelegate): void {
    const currentlyActiveImage = this._viewer.getActive360ImageInfo()?.image360;

    if (currentlyActiveImage === undefined) {
      return;
    }

    stylingCallback(currentlyActiveImage, currentlyActiveImage.getActiveRevision());
  }

  private compute360ImageStyleGroups(): Image360AnnotationStyleGroup[] {
    return this._instanceStyling?.map((group) => {
      return { assetIds: group.assetIds, style: group.style.image360 };
    });
  }
}

function styleAnnotation(
  annotation: Image360Annotation,
  defaultStyling: Image360AnnotationAppearance | undefined,
  collectionStyleGroupsWithSet: CollectionStyleGroupWithAssetSet[]
): void {
  annotation.setColor(defaultStyling?.color);
  annotation.setVisible(defaultStyling?.visible);

  const assetRefId = (
    annotation.annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink
  )?.assetRef?.id;

  if (assetRefId === undefined) {
    return;
  }

  collectionStyleGroupsWithSet.forEach((groupWithSets) => {
    if (assetRefId !== undefined && groupWithSets.assetIdSet.has(assetRefId)) {
      if (groupWithSets.styling.color !== undefined) {
        annotation.setColor(groupWithSets.styling.color);
      }

      if (groupWithSets.styling.visible !== undefined) {
        annotation.setVisible(groupWithSets.styling.visible);
      }
    }
  });
}
