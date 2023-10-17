import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import {
  createLink,
  getCluster,
  getEnvFromCluster,
  getProject,
} from '@cognite/cdf-utilities';

import { DataModelV2, Instance } from '../services/types';

const FUSION_URL = 'fusion.cognite.com';

const useGetEnv = () => {
  const env = getEnvFromCluster();

  // In Fusion, for the EU1-1 cluster (api.cognitedata.com) there are no need of env. variable
  if (env === 'api' || !env) {
    return '';
  }

  return env;
};

export const useLinks = () => {
  const { pathname } = useLocation();
  const cluster = getCluster();
  const project = getProject();
  const env = useGetEnv();

  const createInternalLink = useCallback(
    (path: string, fusionQP?: Record<string, any>) => {
      if (pathname.startsWith('/explore')) {
        return `/explore${path}`;
      }
      return createLink(`/search${path}`, fusionQP);
    },
    [pathname]
  );

  const homePageLink = useCallback(
    (dataModel: DataModelV2) => {
      return createInternalLink(
        `/${dataModel.externalId}/${dataModel.space}/${dataModel.version}`
      );
    },
    [createInternalLink]
  );

  const searchPageLink = useCallback(() => {
    return createInternalLink('/search');
  }, [createInternalLink]);

  const instancePageLink = useCallback(
    (dataModel?: Partial<DataModelV2>, instance?: Partial<Instance>) => {
      return createInternalLink(
        [
          '',
          dataModel?.externalId,
          dataModel?.space,
          dataModel?.version,
          instance?.dataType,
          instance?.instanceSpace,
          instance?.externalId
            ? encodeURIComponent(instance?.externalId)
            : undefined,
        ]
          .filter((item) => item !== undefined)
          .join('/')
      );
    },
    [createInternalLink]
  );

  const filePageLink = useCallback(
    (externalId: string | number) => {
      return createInternalLink(`/file/${encodeURIComponent(externalId)}`);
    },
    [createInternalLink]
  );

  const timeseriesPageLink = useCallback(
    (externalId: string | number, queryParams?: Record<string, any>) => {
      return createInternalLink(
        `/timeseries/${encodeURIComponent(externalId)}`,
        queryParams
      );
    },
    [createInternalLink]
  );

  const sequencePageLink = useCallback(
    (externalId: string | number) => {
      return createInternalLink(`/file/${encodeURIComponent(externalId)}`);
    },
    [createInternalLink]
  );

  const canvasAppLink = useCallback((query: Record<string, any>) => {
    return createLink('/industrial-canvas', query);
  }, []);

  const chartsAppLink = useCallback((query: Record<string, any>) => {
    return createLink(`/charts`, query);
  }, []);

  const classicExplorerLink = useCallback(() => {
    return createLink(`/explore/search`);
  }, []);

  return {
    homePageLink,
    searchPageLink,
    instancePageLink,
    filePageLink,
    sequencePageLink,
    timeseriesPageLink,

    canvasAppLink,
    chartsAppLink,
    classicExplorerLink,
  };
};
