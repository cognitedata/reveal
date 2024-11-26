import { useState } from 'react';
import { PointOfInterest } from '../../../architecture';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { usePoiDomainObject } from './usePoiDomainObject';

export const usePointsOfInterest = () => {
  const poiDomainObject = usePoiDomainObject();

  const [pois, setPois] = useState<Array<PointOfInterest<unknown>>>([]);

  useOnUpdateDomainObject(poiDomainObject, () => {
    setPois([...(poiDomainObject?.pointsOfInterest ?? EMPTY_ARRAY)]);
  });

  return pois;
};
