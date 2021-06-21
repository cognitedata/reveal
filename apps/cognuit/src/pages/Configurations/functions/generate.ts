import { getMappedColumnName } from 'pages/DataTransfers/utils';
import {
  ExtendedConfigurationsResponse,
  GenerateConfigurationsColumns,
} from 'typings/interfaces';

import config from '../Root/configurations.config';

export function generateConfigurationsColumnsFromData(
  response: ExtendedConfigurationsResponse[]
): GenerateConfigurationsColumns[] | undefined {
  const results: GenerateConfigurationsColumns[] = [];

  if (response.length === 0) return undefined;

  Object.keys(response[0]).forEach((key) => {
    if (config.visibleColumns.includes(key)) {
      results.push({
        title: getMappedColumnName(key, 'configurations'),
        dataIndex: key,
        key,
        sorter: !config.nonSortableColumns.includes(key)
          ? (a, b) => (a[key] < b[key] ? -1 : 1)
          : false,
      });
    }
  });

  return results;
}
