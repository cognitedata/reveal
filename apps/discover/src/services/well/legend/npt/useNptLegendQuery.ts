import { useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { NPT_LEGEND_KEY } from 'constants/react-query';

import { WellLegendNptType } from '../types';

const useNptLegendQuery = (type: WellLegendNptType) => {
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(NPT_LEGEND_KEY.lists(type), () =>
    discoverAPI.well.nptLegend.list(headers, project, type)
  );
};

export const useNptLegendCodeQuery = () => {
  return useNptLegendQuery(WellLegendNptType.Code);
};

export const useNptLegendDetailCodeQuery = () => {
  return useNptLegendQuery(WellLegendNptType.DetailCode);
};
