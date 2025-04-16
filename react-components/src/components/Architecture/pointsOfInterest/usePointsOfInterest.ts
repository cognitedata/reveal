/*!
 * Copyright 2024 Cognite AS
 */
import { useState } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { usePoiDomainObject } from './usePoiDomainObject';

export const usePointsOfInterest = (): Array<PointOfInterest<unknown>> => {
  const poiDomainObject = usePoiDomainObject();

  const [pois, setPois] = useState<Array<PointOfInterest<unknown>>>([]);

  useOnUpdateDomainObject(poiDomainObject, () => {
    setPois([...(poiDomainObject?.pointsOfInterest ?? [])]);
  });

  return pois;
};
