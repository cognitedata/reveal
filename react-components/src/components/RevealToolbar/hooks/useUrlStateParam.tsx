/*!
 * Copyright 2023 Cognite AS
 */

import { useCallback, useMemo } from 'react';
import {
  type LayersUrlStateParam,
  type CadLayersUrlStateParam,
  type PointCloudLayersUrlStateParam,
  type Image360LayersUrlStateParam
} from '../../../hooks/types';

type SearchParamsHookResult = {
  url: URL;
  searchParams: URLSearchParams;
};

const useSearchParams = (): SearchParamsHookResult => {
  const url = new URL(window.location.toString());
  const searchParams = useMemo(() => url.searchParams, [url]);
  return { url, searchParams };
};

export enum ParamKeys {
  SlicerState = 'slicerState',
  CadLayersState = 'cadLayersState',
  PointCloudLayersState = 'pointCloudLayersState',
  Image360LayersState = 'image360LayersState'
}

export const useSlicerUrlParams = (): [
  { top: number; bottom: number },
  (slicerBottomTop: number[]) => void
] => {
  const { url, searchParams } = useSearchParams();

  const slicerUrlState = useMemo(() => {
    const bottomTop = searchParams.get(ParamKeys.SlicerState);

    if (bottomTop !== null && bottomTop !== undefined) {
      const [bottom, top] = JSON.parse(bottomTop);
      return { bottom, top };
    }

    return { bottom: 0, top: 1 };
  }, [searchParams]);

  const setSlicerUrlState = useCallback(
    (slicerBottomTop: number[]) => {
      searchParams.set(ParamKeys.SlicerState, JSON.stringify(slicerBottomTop));
      window.history.pushState({}, '', url);
    },
    [searchParams]
  );

  return [slicerUrlState, setSlicerUrlState];
};

export const useLayersUrlParams = (): [
  LayersUrlStateParam,
  (layers: LayersUrlStateParam) => void
] => {
  const { url, searchParams } = useSearchParams();

  const layersUrlState = useMemo(() => {
    const cadInstance = searchParams.get(ParamKeys.CadLayersState);
    const pointCloudInstance = searchParams.get(ParamKeys.PointCloudLayersState);
    const image360Instance = searchParams.get(ParamKeys.Image360LayersState);

    const cadLayers = (() => {
      if (cadInstance !== null) {
        const cadModelsUrlData = JSON.parse(cadInstance) as Array<
          Pick<CadLayersUrlStateParam, 'revisionId' | 'applied' | 'index'>
        >;
        return cadModelsUrlData.map((model) => ({ ...model }));
      }
      return [];
    })();

    const pointCloudLayers = (() => {
      if (pointCloudInstance !== null) {
        const pointCloudModelsUrlData = JSON.parse(pointCloudInstance) as Array<
          Pick<PointCloudLayersUrlStateParam, 'revisionId' | 'applied' | 'index'>
        >;
        return pointCloudModelsUrlData.map((model) => ({ ...model }));
      }
      return [];
    })();

    const image360Layers = (() => {
      if (image360Instance !== null) {
        const image360UrlData = JSON.parse(image360Instance) as Array<
          Pick<Image360LayersUrlStateParam, 'siteId' | 'applied'>
        >;
        return image360UrlData.map((image360) => ({ ...image360 }));
      }
      return [];
    })();

    return {
      cadLayers,
      pointCloudLayers,
      image360Layers
    };
  }, [searchParams]);

  const setLayersUrlState = useCallback(
    (layers: LayersUrlStateParam) => {
      const { cadLayers, pointCloudLayers, image360Layers } = layers;

      if (cadLayers !== undefined && cadLayers.length !== 0) {
        url.searchParams.set(ParamKeys.CadLayersState, JSON.stringify(cadLayers));
      }
      if (pointCloudLayers !== undefined && pointCloudLayers.length !== 0) {
        url.searchParams.set(ParamKeys.PointCloudLayersState, JSON.stringify(pointCloudLayers));
      }
      if (image360Layers !== undefined && image360Layers.length !== 0) {
        url.searchParams.set(ParamKeys.Image360LayersState, JSON.stringify(image360Layers));
      }
      window.history.pushState({}, '', url);
    },
    [searchParams]
  );

  return [layersUrlState, setLayersUrlState];
};
