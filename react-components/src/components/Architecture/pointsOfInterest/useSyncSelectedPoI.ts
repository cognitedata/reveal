import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { PointOfInterest, PointsOfInterestDomainObject } from '../../../architecture';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { useRenderTarget } from '../../RevealCanvas';
import { usePoIDomainObject } from './usePoIDomainObject';

export const useSyncSelectedPoI = (
  selectedPoi: PointOfInterest<any> | undefined,
  setSelectedPoi: (poi: PointOfInterest<any> | undefined) => void
) => {
  const renderTarget = useRenderTarget();
  const domainObject = usePoIDomainObject();

  const lastSelectedPoiInternal = useRef<PointOfInterest<any> | undefined>(undefined);

  useOnUpdateDomainObject(domainObject, () => {
    const internalPoi = domainObject?.selectedPointsOfInterest;
    if (lastSelectedPoiInternal.current === internalPoi) {
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
