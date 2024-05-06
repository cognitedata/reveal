import {
  Cognite3DViewer,
  Image360,
  Image360Annotation,
  Image360AnnotationAppearance,
  Image360Collection,
  Image360EnteredDelegate,
  Image360Revision
} from '@cognite/reveal';
import {
  AddOptionsWithModel,
  Image360AddOptionsWithModel,
  Image360AnnotationStyleGroup
} from './ResourceUpdater';
import { DefaultResourceStyling, Image360AssetStylingGroup, InstanceStylingGroup } from './types';
import { AnnotationsCogniteAnnotationTypesImagesAssetLink } from '@cognite/sdk';
import { is360ImageCollectionOptions } from '../../utilities/isSameModel';
import { isImage360AssetStylingGroup } from '../../utilities/StylingGroupUtils';

type CollectionStyleGroupWithAssetSet = {
  styling: Image360AnnotationAppearance;
  assetIdSet: Set<number>;
};

export class Image360StylingHandler {
  private _collections: Image360AddOptionsWithModel[];
  private _defaultStyling: DefaultResourceStyling['image360'] = undefined;
  private _instanceStyling: Image360AssetStylingGroup[] = [];
  private _viewer: Cognite3DViewer;

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
  ) {
    this._defaultStyling = defaultStyling;
    this._instanceStyling = instanceStyling.filter(isImage360AssetStylingGroup);
  }

  async setCollections(models: AddOptionsWithModel[]): Promise<void> {
    const collections = models.filter((model): model is Image360AddOptionsWithModel =>
      is360ImageCollectionOptions(model.addOptions)
    );

    this._collections.push(...collections);
  }

  removeCollection(collection: Image360AddOptionsWithModel) {
    const foundCollectionIndex = this._collections.findIndex(
      (storedCollection) => storedCollection === collection
    );
    if (foundCollectionIndex !== -1) {
      this._collections.splice(foundCollectionIndex, 1);
    }
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
      annotations.forEach((annotation) =>
        styleAnnotation(annotation, defaultStyling, collectionStyleGroupsWithSet)
      );
    };

    collection.on('image360Entered', onEnteredStylingCallback);
    this._previousImage360StylingCallbacks.set(collectionId, onEnteredStylingCallback);

    this.styleCurrentlyEntered360Image(onEnteredStylingCallback);
  }

  private styleCurrentlyEntered360Image(stylingCallback: Image360EnteredDelegate) {
    const currentlyActiveImage = this._viewer.getActive360ImageInfo()?.image360;

    if (currentlyActiveImage === undefined) {
      return;
    }

    stylingCallback(currentlyActiveImage, currentlyActiveImage.getActiveRevision());
  }

  private compute360ImageStyleGroups(): Image360AnnotationStyleGroup[] {
    console.log('Computing from instance styling!', this._instanceStyling);
    return this._instanceStyling?.map((group) => {
      return { assetIds: group.assetIds, style: group.style.image360 };
    });
  }
}

function styleAnnotation(
  annotation: Image360Annotation,
  defaultStyling: Image360AnnotationAppearance | undefined,
  collectionStyleGroupsWithSet: CollectionStyleGroupWithAssetSet[]
) {
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
