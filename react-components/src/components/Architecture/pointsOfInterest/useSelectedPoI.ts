import { useState } from 'react';
import { PointOfInterest, PointsOfInterestDomainObject } from '../../../architecture';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { useRenderTarget } from '../../RevealCanvas';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { usePoIDomainObject } from './usePoIDomainObject';

export function useSelectedPoI(): PointOfInterest<any> | undefined {
  const poiDomainObject = usePoIDomainObject();

  const [selectedPoI, setSelectedPoI] = useState<PointOfInterest<any> | undefined>(
    poiDomainObject?.selectedPointsOfInterest
  );

  useOnUpdateDomainObject(poiDomainObject, () => {
    setSelectedPoI(poiDomainObject?.selectedPointsOfInterest);
  });

  return selectedPoI;
}
