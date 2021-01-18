import { useLocation } from 'react-router-dom';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { GenericResponseObject, Rule } from '../typings/interfaces';
import { getMappedColumnName } from '../pages/DataTransfers/utils';
import config from '../pages/Configurations/configurations.config';

export function stringToBoolean(input: string): boolean | undefined {
  try {
    return JSON.parse(input.toLowerCase());
  } catch (e) {
    return undefined;
  }
}

export function curateConfigurationsData(data: GenericResponseObject[]) {
  if (data.length === 0) return data;
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

export function generateConfigurationsColumnsFromData(
  response: GenericResponseObject[]
): ColumnsType<GenericResponseObject> | undefined {
  const results: ColumnsType<GenericResponseObject> = [];

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

export function curateColumns(
  columns: ColumnsType<GenericResponseObject> | undefined,
  rules: any
) {
  if (columns) {
    const tmp = columns.map((col) => ({
      ...col,
      title: getMappedColumnName(String(col.title)),
    }));
    rules.map((rule: Rule) => {
      const index = columns.findIndex(
        (column: ColumnType<any>) => column.key === rule.key
      );
      if (index > -1) {
        tmp[index].render = rule.render;
      }
      return null;
    });
    return tmp;
  }
  return [];
}

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
