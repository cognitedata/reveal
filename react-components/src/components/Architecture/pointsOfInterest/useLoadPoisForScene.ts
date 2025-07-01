import { useEffect } from 'react';
import { usePoiDomainObject } from './usePoiDomainObject';

export const useLoadPoisForScene = (sceneExternalId: string, sceneSpace: string): void => {
  const poiDomainObject = usePoiDomainObject();

  useEffect(() => {
    void poiDomainObject?.setCurrentScene({ externalId: sceneExternalId, space: sceneSpace });

    return () => {
      void poiDomainObject?.setCurrentScene(undefined);
    };
  }, [sceneExternalId, sceneSpace, poiDomainObject]);
};
