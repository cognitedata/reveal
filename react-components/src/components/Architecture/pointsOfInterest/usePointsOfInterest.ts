import { useState } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { useOnUpdateDomainObject } from '../hooks/useOnUpdate';
import { usePoiDomainObject } from './usePoiDomainObject';

export const usePointsOfInterest = (): Array<PointOfInterest<unknown>> => {
  const poiDomainObject = usePoiDomainObject();

  const [pois, setPois] = useState<Array<PointOfInterest<unknown>>>([]);

  useOnUpdateDomainObject(poiDomainObject, () => {
    setPois([...(poiDomainObject?.pointsOfInterest ?? EMPTY_ARRAY)]);
  });

  return pois;
};
