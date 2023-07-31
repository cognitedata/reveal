import {
  ExtendedConfigurationsResponse,
  GenerateConfigurationsColumns,
} from 'typings/interfaces';
import config from 'configs/configurations.config';
import { getMappedColumnName } from 'utils/columns';

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
        sorter: !!config.nonSortableColumns.includes(key),
      });
    }
  });

  return results;
}
