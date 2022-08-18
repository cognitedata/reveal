import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { MapProps } from '../types';

import { useDeepEffect } from './useDeep';

export const useFeatures = ({
  features,
  draw,
}: {
  draw?: MapboxDraw;
  features: MapProps['features'];
}) => {
  useDeepEffect(() => {
    if (features && features.type && draw) {
      draw.set(features);
    }
  }, [features, draw]);
};
