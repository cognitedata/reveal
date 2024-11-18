/*!
 * Copyright 2024 Cognite AS
 */
import { useState } from 'react';
import { type PointsOfInterestDomainObject } from '../../../architecture';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { useRenderTarget } from '../../RevealCanvas';
import { useOnUpdate } from '../useOnUpdate';

export function usePoiDomainObject(): PointsOfInterestDomainObject<unknown> | undefined {
  const renderTarget = useRenderTarget();
  const poiTool = renderTarget.commandsController.getToolByType(PointsOfInterestTool);

  const [poiDomainObject, setPoiDomainObject] = useState<
    PointsOfInterestDomainObject<unknown> | undefined
  >(undefined);

  useOnUpdate(poiTool, () => {
    setPoiDomainObject(poiTool?.getPointsOfInterestDomainObject());
  });

  return poiDomainObject;
}
