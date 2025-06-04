import { useEffect, useRef } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { useRenderTarget } from '../../RevealCanvas';
import { usePoiDomainObject } from './usePoiDomainObject';

export const useSyncSelectedPoi = (
  selectedPoi: PointOfInterest<unknown> | undefined,
  setSelectedPoi: (poi: PointOfInterest<unknown> | undefined) => void
): void => {
  const renderTarget = useRenderTarget();
  const domainObject = usePoiDomainObject();

  const lastSelectedPoiInternal = useRef<PointOfInterest<unknown> | undefined>(undefined);

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
    if (selectedPoi !== undefined) {
      domainObject?.setVisibleInteractive(true, renderTarget);
    }
  }, [selectedPoi, domainObject]);
};
