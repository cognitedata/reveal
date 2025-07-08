import { createContext, useContext, useMemo } from 'react';
import { type CogniteModel, type DataSourceType } from '@cognite/reveal';
import { useRevealDomainObjects } from './useRevealDomainObjects';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { isDefined } from '../utilities/isDefined';

export type Use3dModelsDependencies = {
  useRevealDomainObjects: typeof useRevealDomainObjects;
};

export const Use3dModelsContext = createContext<Use3dModelsDependencies>({
  useRevealDomainObjects
});

/**
 * Returns DomainObjects corresponding to the CogniteModel model types in
 * Reveal; i.e. CAD and Point clouds only
 */
export const use3dModels = (): Array<CogniteModel<DataSourceType>> => {
  const { useRevealDomainObjects } = useContext(Use3dModelsContext);

  const domainObjects = useRevealDomainObjects();

  return useMemo(
    () =>
      domainObjects
        .filter(
          (domainObject) =>
            domainObject instanceof PointCloudDomainObject ||
            domainObject instanceof CadDomainObject
        )
        .map((domainObject) => domainObject.model)
        .filter(isDefined),
    [domainObjects]
  );
};
