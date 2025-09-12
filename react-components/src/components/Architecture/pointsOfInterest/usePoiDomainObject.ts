import { useState } from 'react';
import { PointsOfInterestDomainObject } from '../../../architecture';
import { useRenderTarget } from '../../RevealCanvas';
import { useOnUpdateDomainObject } from '../hooks/useOnUpdate';

export function usePoiDomainObject(): PointsOfInterestDomainObject<unknown> | undefined {
  const renderTarget = useRenderTarget();

  const [poiDomainObject, setPoiDomainObject] = useState<
    PointsOfInterestDomainObject<unknown> | undefined
  >(undefined);

  useOnUpdateDomainObject(renderTarget.root, () => {
    if (poiDomainObject !== undefined) {
      return;
    }
    setPoiDomainObject(renderTarget.root.getDescendantByType(PointsOfInterestDomainObject));
  });

  return poiDomainObject;
}
