import { type ReactElement, useCallback, useContext, useEffect, useRef } from 'react';
import { type DataSourceType, type Image360Collection } from '@cognite/reveal';
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
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';

import { Image360CollectionContainerContext } from './Image360CollectionContainer.context';

type Image360CollectionContainerProps = {
  addImage360CollectionOptions: AddImage360CollectionOptions;
  styling?: ImageCollectionModelStyling;
  defaultVisible?: boolean;
  onLoad?: (image360: Image360Collection<DataSourceType>) => void;
  onLoadError?: (addOptions: AddImage360CollectionOptions, error: any) => void;
};

export function Image360CollectionContainer({
  addImage360CollectionOptions,
  styling,
  defaultVisible,
  onLoad,
  onLoadError
}: Image360CollectionContainerProps): ReactElement {
  const {
    useRenderTarget,
    useRevealKeepAlive,
    useReveal3DResourcesCount,
    useReveal3DResourceLoadFailCount,
    createImage360CollectionDomainObject,
    removeImage360CollectionDomainObject
  } = useContext(Image360CollectionContainerContext);

  const cachedViewerRef = useRevealKeepAlive();
  const renderTarget = useRenderTarget();
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const { setReveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();

  const viewer = renderTarget.viewer;
  const modelRef = useRef<Image360Collection<DataSourceType>>();
  const initializingSiteId = useRef<{ siteId: string } | { externalId: string } | undefined>(
    undefined
  );

  const remove360Collection = useCallback((): void => {
    if (modelRef.current === undefined) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    removeImage360CollectionDomainObject(renderTarget, modelRef.current);
    setRevealResourcesCount(getViewerResourceCount(viewer));
    modelRef.current = undefined;
  }, [
    viewer,
    renderTarget,
    cachedViewerRef,
    setRevealResourcesCount,
    removeImage360CollectionDomainObject
  ]);

  const add360Collection = useCallback(
    async (transform?: Matrix4): Promise<() => void> => {
      return await getOrAdd360Collection()
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
          return remove360Collection;
        })
        .catch((error: any) => {
          const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
          errorReportFunction(addImage360CollectionOptions, error);
          setReveal3DResourceLoadFailCount((p) => p + 1);
          return () => {
            setReveal3DResourceLoadFailCount((p) => p - 1);
          };
        });

      async function getOrAdd360Collection(): Promise<Image360Collection<DataSourceType>> {
        const collections = viewer.get360ImageCollections();
        const siteId =
          addImage360CollectionOptions.source === 'events'
            ? addImage360CollectionOptions.siteId
            : addImage360CollectionOptions.externalId;
        const collection = collections.find((collection) => collection.id === siteId);
        if (collection !== undefined) {
          return collection;
        }
        return await createImage360CollectionDomainObject(
          renderTarget,
          addImage360CollectionOptions,
          defaultVisible
        );
      }
    },
    [
      viewer,
      renderTarget,
      defaultVisible,
      addImage360CollectionOptions,
      onLoad,
      onLoadError,
      remove360Collection,
      setRevealResourcesCount,
      setReveal3DResourceLoadFailCount,
      createImage360CollectionDomainObject
    ]
  );

  useEffect(() => {
    if (
      addImage360CollectionOptions.source === 'events' &&
      initializingSiteId.current === addImage360CollectionOptions
    ) {
      return;
    }

    initializingSiteId.current = addImage360CollectionOptions;

    const cleanupCallbackPromise = add360Collection(addImage360CollectionOptions.transform);
    return () => {
      void cleanupCallbackPromise.then((callback) => {
        callback();
      });
    };
  }, [addImage360CollectionOptions, add360Collection]);

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
}

const useSetIconCulling = (
  collection?: Image360Collection<DataSourceType>,
  cullingParameters?: { radius?: number; iconCountLimit?: number }
): void => {
  const radius = cullingParameters?.radius;
  const iconCountLimit = cullingParameters?.iconCountLimit;

  useEffect(() => {
    setCollectionCullingOptions(collection, cullingParameters);
  }, [collection, radius, iconCountLimit, cullingParameters]);
};

function setCollectionCullingOptions(
  collection?: Image360Collection<DataSourceType>,
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
