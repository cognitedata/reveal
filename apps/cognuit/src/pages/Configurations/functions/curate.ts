import isUndefined from 'lodash/isUndefined';
import { TableProps } from '@cognite/cogs.js';
import { ConfigurationsResponse } from 'types/ApiInterface';
import {
  ExtendedConfigurationsResponse,
  GenerateConfigurationsColumns,
  Rule,
} from 'typings/interfaces';

export function curateConfigurationsData(
  data: ConfigurationsResponse[]
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

export function curateColumns(
  columns: GenerateConfigurationsColumns[] | undefined,
  rules: Rule[]
): TableProps<ConfigurationsResponse>['columns'] {
  if (isUndefined(columns)) {
    return [];
  }

  const curatedColumns = columns.map((column) => {
    const rule = rules.find((rule: Rule) => rule.key === column.key);

    return {
      Header: column.title,
      accessor: column.key,
      Cell: rule?.render,
      disableSortBy: rule?.disableSortBy,
    };
  });

  return curatedColumns;
}
