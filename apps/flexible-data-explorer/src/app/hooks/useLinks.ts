import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import {
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

  const basename = useMemo(
    () => (pathname.startsWith('/explore') ? '/explore' : ''),
    [pathname]
  );

  const homePageLink = useCallback(
    (dataModel: DataModelV2) => {
      return `${basename}/${dataModel.externalId}/${dataModel.space}/${dataModel.version}`;
    },
    [basename]
  );

  const searchPageLink = useCallback(() => {
    return `${basename}/search`;
  }, [basename]);

  const instancePageLink = useCallback(
    (dataModel?: Partial<DataModelV2>, instance?: Partial<Instance>) => {
      return [
        basename,
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
        .join('/');
    },
    [basename]
  );

  const filePageLink = useCallback(
    (externalId: string | number) => {
      return `${basename}/file/${encodeURIComponent(externalId)}`;
    },
    [basename]
  );

  const timeseriesPageLink = useCallback(
    (externalId: string | number) => {
      return `${basename}/timeseries/${encodeURIComponent(externalId)}`;
    },
    [basename]
  );

  const sequencePageLink = useCallback(
    (externalId: string | number) => {
      return `${basename}/file/${encodeURIComponent(externalId)}`;
    },
    [basename]
  );

  const canvasAppLink = useCallback(
    (query: string) => {
      return `https://${FUSION_URL}/${project}/industrial-canvas?cluster=${cluster}&env=${env}&${query}`;
    },
    [cluster, env, project]
  );

  const chartsAppLink = useCallback(
    (query: string) => {
      return `https://${FUSION_URL}/${project}/charts?cluster=${cluster}&env=${env}&${query}`;
    },
    [cluster, env, project]
  );

  const classicExplorerLink = useCallback(() => {
    return `https://${FUSION_URL}/${project}/explore/search?cluster=${cluster}&env=${env}`;
  }, [cluster, env, project]);

  return {
    basename,
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
