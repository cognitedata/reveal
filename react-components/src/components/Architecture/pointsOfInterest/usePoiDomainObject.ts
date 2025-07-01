import { useState } from 'react';
import { PointsOfInterestDomainObject } from '../../../architecture';
import { useRenderTarget } from '../../RevealCanvas';
import { useOnUpdateDomainObject } from '../hooks/useOnUpdate';

export function usePoiDomainObject(): PointsOfInterestDomainObject<unknown> | undefined {
  const renderTarget = useRenderTarget();

  const [poiDomainObject, setPoiDomainObject] = useState<
    PointsOfInterestDomainObject<unknown> | undefined
  >(undefined);

  useOnUpdateDomainObject(renderTarget.rootDomainObject, () => {
    if (poiDomainObject !== undefined) {
      return;
    }
    setPoiDomainObject(
      renderTarget.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject)
    );
  });

  return poiDomainObject;
}
