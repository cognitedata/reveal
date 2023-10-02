/*!
 * Copyright 2023 Cognite AS
 */

import {
  type SlicerUrlStateParam,
  type LayersUrlStateParam,
  type CadLayersUrlStateParam,
  type PointCloudLayersUrlStateParam,
  type Image360LayersUrlStateParam
} from './types';

export type UrlStateParamActions = {
  getSlicerStateFromUrlParam: () => SlicerUrlStateParam;
  setUrlParamOnSlicerChanged: (slicerTopBottom: number[]) => void;
  getLayersFromUrlParam: () => LayersUrlStateParam;
  setUrlParamOnLayersChanged: (layers: LayersUrlStateParam) => void;
};

export const useUrlStateParam = (): UrlStateParamActions => {
  const url = new URL(window.location.toString());

  const getSlicerStateFromUrlParam = (): SlicerUrlStateParam => {
    const topBottom = url.searchParams.get('slicerState');
    if (topBottom === null || topBottom === undefined) {
      return { top: 1, bottom: 0 };
    }
    const [top, bottom] = JSON.parse(topBottom);

    return { top, bottom };
  };

  const setUrlParamOnSlicerChanged = (slicerTopBottom: number[]): void => {
    url.searchParams.set('slicerState', `[${slicerTopBottom.join(',')}]`);
    window.history.pushState({}, '', url);
  };

  const getLayersFromUrlParam = (): LayersUrlStateParam => {
    const cadLayers = (() => {
      const s = url.searchParams.get('cadLayers');
      if (s !== null) {
        const cadModelsUrlData = JSON.parse(s) as Array<
          Pick<CadLayersUrlStateParam, 'revisionId' | 'applied' | 'index'>
        >;
        return cadModelsUrlData.map((model) => ({ ...model }));
      }
      return [];
    })();

    const pointCloudLayers = (() => {
      const s = url.searchParams.get('pointCloudLayers');
      if (s !== null) {
        const pointCloudModelsUrlData = JSON.parse(s) as Array<
          Pick<PointCloudLayersUrlStateParam, 'revisionId' | 'applied' | 'index'>
        >;
        return pointCloudModelsUrlData.map((model) => ({ ...model }));
      }
      return [];
    })();

    const image360Layers = (() => {
      const s = url.searchParams.get('image360Layers');
      if (s !== null) {
        const image360UrlData = JSON.parse(s) as Array<
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
  };

  const setUrlParamOnLayersChanged = (layers: LayersUrlStateParam): void => {
    const { cadLayers, pointCloudLayers, image360Layers } = layers;

    if (cadLayers !== undefined && cadLayers.length !== 0) {
      url.searchParams.set('cadLayers', JSON.stringify(cadLayers));
    }
    if (pointCloudLayers !== undefined && pointCloudLayers.length !== 0) {
      url.searchParams.set('pointCloudLayers', JSON.stringify(pointCloudLayers));
    }
    if (image360Layers !== undefined && image360Layers.length !== 0) {
      url.searchParams.set('image360Layers', JSON.stringify(image360Layers));
    }

    window.history.pushState({}, '', url);
  };

  return {
    getSlicerStateFromUrlParam,
    setUrlParamOnSlicerChanged,
    getLayersFromUrlParam,
    setUrlParamOnLayersChanged
  };
};
