import { useEffect, useRef } from 'react';
import { PointOfInterest } from '../../../architecture';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { useRenderTarget } from '../../RevealCanvas';
import { usePoiDomainObject } from './usePoiDomainObject';

export const useSyncSelectedPoi = (
  selectedPoi: PointOfInterest<any> | undefined,
  setSelectedPoi: (poi: PointOfInterest<any> | undefined) => void
) => {
  const renderTarget = useRenderTarget();
  const domainObject = usePoiDomainObject();

  const lastSelectedPoiInternal = useRef<PointOfInterest<any> | undefined>(undefined);

  useOnUpdateDomainObject(domainObject, () => {
    const internalPoi = domainObject?.selectedPointsOfInterest;
    if (lastSelectedPoiInternal.current === internalPoi || domainObject === undefined) {
      return;
    }

    lastSelectedPoiInternal.current = internalPoi;

    setSelectedPoi(domainObject?.selectedPointsOfInterest);
  });

  useEffect(() => {
    domainObject?.setSelectedPointOfInterest(selectedPoi);
    if (selectedPoi) {
      domainObject?.setVisibleInteractive(true, renderTarget);
    }
  }, [selectedPoi, domainObject]);
};
