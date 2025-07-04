import { useState } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { useOnUpdateDomainObject } from '../hooks/useOnUpdate';
import { usePoiDomainObject } from './usePoiDomainObject';

export function useSelectedPoi(): PointOfInterest<any> | undefined {
  const poiDomainObject = usePoiDomainObject();

  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest<any> | undefined>(
    poiDomainObject?.selectedPointsOfInterest
  );

  useOnUpdateDomainObject(poiDomainObject, () => {
    setSelectedPoi(poiDomainObject?.selectedPointsOfInterest);
  });

  return selectedPoi;
}
