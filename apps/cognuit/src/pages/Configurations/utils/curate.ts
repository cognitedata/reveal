import isUndefined from 'lodash/isUndefined';
import { ConfigurationsResponse } from 'types/ApiInterface';
import { ExtendedConfigurationsResponse } from 'typings/interfaces';

export function curateConfigurationsData(
  data?: ConfigurationsResponse[]
): ExtendedConfigurationsResponse[] {
  if (isUndefined(data) || data.length === 0) return [];

  return data.map((item) => ({
    ...item,
    statusColor: item.status_active,
    repoProject: `${item.source.external_id} / ${item.target.external_id}`,
    actions: {
      direction: item.source.source === 'Studio' ? 'psToOw' : 'owToPs',
      statusActive: item.status_active,
      id: item.id,
      name: item.name,
    },
    conf_name: {
      name: item.name,
      id: item.id,
    },
  }));
}
