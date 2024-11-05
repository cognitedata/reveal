/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { type Image360Collection } from '@cognite/reveal';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type AddImage360CollectionOptions } from '../Reveal3DResources/types';
import {
  type ImageCollectionModelStyling,
  useApply360AnnotationStyling
} from './useApply360AnnotationStyling';
import { type Matrix4 } from 'three';
import {
  DEFAULT_IMAGE360_ICON_COUNT_LIMIT,
  DEFAULT_IMAGE360_ICON_CULLING_RADIUS
} from './constants';
import {
  useReveal3DResourceLoadFailCount,
  useReveal3DResourcesCount,
  useThisAsExpectedResourceLoad
} from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';

type Image360CollectionContainerProps = {
  addImage360CollectionOptions: AddImage360CollectionOptions;
  styling?: ImageCollectionModelStyling;
  onLoad?: (image360: Image360Collection) => void;
  onLoadError?: (addOptions: AddImage360CollectionOptions, error: any) => void;
};

export function Image360CollectionContainer({
  addImage360CollectionOptions,
  styling,
  onLoad,
  onLoadError
}: Image360CollectionContainerProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const modelRef = useRef<Image360Collection>();
  const viewer = useReveal();
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const { setReveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();

  const initializingSiteId = useRef<{ siteId: string } | { externalId: string } | undefined>(
    undefined
  );

  useThisAsExpectedResourceLoad();

  useEffect(() => {
    if (
      'siteId' in addImage360CollectionOptions &&
      initializingSiteId.current === addImage360CollectionOptions
    ) {
      return;
    }

    initializingSiteId.current = addImage360CollectionOptions;

    void add360Collection(addImage360CollectionOptions.transform);
    return remove360Collection;
  }, [addImage360CollectionOptions]);

  useApply360AnnotationStyling(modelRef.current, styling);
  useSetIconCulling(modelRef.current, addImage360CollectionOptions.iconCullingOptions);

  useEffect(() => {
    if (
      modelRef.current === undefined ||
      addImage360CollectionOptions.transform === undefined ||
      !viewer.get360ImageCollections().includes(modelRef.current)
    ) {
      return;
    }

    modelRef.current.setModelTransformation(addImage360CollectionOptions.transform);
  }, [modelRef, addImage360CollectionOptions.transform, viewer]);

  return <></>;

  async function add360Collection(transform?: Matrix4): Promise<void> {
    await getOrAdd360Collection()
      .then((image360Collection) => {
        if (transform !== undefined) {
          image360Collection.setModelTransformation(transform);
        }

        setCollectionCullingOptions(
          image360Collection,
          addImage360CollectionOptions.iconCullingOptions
        );

        modelRef.current = image360Collection;
        onLoad?.(image360Collection);
        setRevealResourcesCount(getViewerResourceCount(viewer));
      })
      .catch((error: any) => {
        const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
        errorReportFunction(addImage360CollectionOptions, error);
        setReveal3DResourceLoadFailCount((p) => p + 1);
        return () => setReveal3DResourceLoadFailCount((p) => p - 1);
      });

    async function getOrAdd360Collection(): Promise<Image360Collection> {
      const collections = viewer.get360ImageCollections();
      const siteId =
        'siteId' in addImage360CollectionOptions
          ? addImage360CollectionOptions.siteId
          : addImage360CollectionOptions.externalId;
      const collection = collections.find((collection) => collection.id === siteId);
      if (collection !== undefined) {
        return collection;
      }

      if ('siteId' in addImage360CollectionOptions) {
        return await viewer.add360ImageSet(
          'events',
          { site_id: siteId },
          { preMultipliedRotation: false }
        );
      } else {
        return await viewer.add360ImageSet('datamodels', {
          image360CollectionExternalId: addImage360CollectionOptions.externalId,
          space: addImage360CollectionOptions.space
        });
      }
    }
  }

  function remove360Collection(): void {
    if (modelRef.current === undefined) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    viewer.remove360ImageSet(modelRef.current);
    setRevealResourcesCount(getViewerResourceCount(viewer));
    modelRef.current = undefined;
  }
}

const useSetIconCulling = (
  collection?: Image360Collection,
  cullingParameters?: { radius?: number; iconCountLimit?: number }
): void => {
  const radius = cullingParameters?.radius;
  const iconCountLimit = cullingParameters?.iconCountLimit;

  useEffect(() => {
    setCollectionCullingOptions(collection, cullingParameters);
  }, [collection, radius, iconCountLimit]);
};

function setCollectionCullingOptions(
  collection?: Image360Collection,
  cullingParameters?: { radius?: number; iconCountLimit?: number }
): void {
  collection?.set360IconCullingRestrictions(
    cullingParameters?.radius ?? DEFAULT_IMAGE360_ICON_CULLING_RADIUS,
    cullingParameters?.iconCountLimit ?? DEFAULT_IMAGE360_ICON_COUNT_LIMIT
  );
}

function defaultLoadErrorHandler(addOptions: AddImage360CollectionOptions, error: any): void {
  console.warn(
    `Failed to load image collection ${
      'siteId' in addOptions ? addOptions.siteId : addOptions.externalId
    }: ${JSON.stringify(error)}`
  );
}
