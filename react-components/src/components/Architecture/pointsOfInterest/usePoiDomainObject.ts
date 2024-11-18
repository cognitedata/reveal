import { useState } from 'react';
import { PointsOfInterestDomainObject } from '../../../architecture';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { useRenderTarget } from '../../RevealCanvas';
import { useOnUpdate } from '../useOnUpdate';

export function usePoiDomainObject(): PointsOfInterestDomainObject<any> | undefined {
  const renderTarget = useRenderTarget();
  const poiTool = renderTarget.commandsController.getToolByType(PointsOfInterestTool);

  const [poiDomainObject, setPoiDomainObject] = useState<
    PointsOfInterestDomainObject<any> | undefined
  >(undefined);

  useOnUpdate(poiTool, () => {
    setPoiDomainObject(poiTool?.getPointsOfInterestDomainObject());
  });

  return poiDomainObject;
}
