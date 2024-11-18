import { useState } from 'react';
import { PointOfInterest, PointsOfInterestDomainObject } from '../../../architecture';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { useRenderTarget } from '../../RevealCanvas';
import { useOnUpdateDomainObject } from '../useOnUpdate';
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
