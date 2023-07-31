import { featureCollection } from '@turf/helpers';
import * as React from 'react';

import { MapFeatureCollection, MapProps } from '../types';

import { useDeepEffect } from './useDeep';

export const useUserDrawnFeatures = ({
  draw,
  initialDrawnFeatures,
}: {
  draw?: MapboxDraw;
  initialDrawnFeatures: MapProps['initialDrawnFeatures'];
}) => {
  const hasInitialFeatures =
    initialDrawnFeatures && initialDrawnFeatures?.features?.length > 0;
  const [drawnFeatures, setDrawnFeatures] =
    React.useState<MapFeatureCollection>(
      hasInitialFeatures ? initialDrawnFeatures : featureCollection([])
    );

  React.useEffect(() => {
    if (initialDrawnFeatures) {
      setDrawnFeatures(initialDrawnFeatures);
    }
  }, [initialDrawnFeatures]);

  // update with useFeatures and add stories
  useDeepEffect(() => {
    if (drawnFeatures && draw) {
      // this is because draw cannot handle the multipolygon case
      // but we never let users do this... so i think we are ok
      // @ts-expect-error Type 'string' is not assignable to type '"MultiPolygon"'
      draw.set(drawnFeatures);
    }
  }, [drawnFeatures, !!draw]);

  return { drawnFeatures, setDrawnFeatures };
};
