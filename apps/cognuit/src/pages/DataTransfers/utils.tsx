import { format } from 'date-fns';
import { DataTransferObject, UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { ColumnsType } from 'antd/lib/table';
import { Colors } from '@cognite/cogs.js';
import { apiStatuses } from 'utils/statuses';

import configurationsConfig from '../Configurations/Root/configurations.config';

import dataTransfersConfig from './datatransfer.config';
import { StatusDot } from './elements';

export const getFormattedTimestampOrString = (revision: string | number) => {
  if (new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR).getTime() > 0) {
    return format(new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR), 'Pp');
  }
  return revision;
};

export const getMappedColumnName = (
  colName: string,
  page = 'datatransfers'
) => {
  let mapped = null;
  if (page === 'datatransfers') {
    mapped = dataTransfersConfig.columnNameMapping.find(
      (item) => item.keyName === colName
    );
  } else if (page === 'configurations') {
    mapped = configurationsConfig.columnNameMapping.find(
      (item) => item.keyName === colName
    );
  }
  if (mapped) {
    return mapped.value;
  }
  return colName;
};

export function selectColumns(
  dataTransferObjects: DataTransferObject[],
  columnNames: string[]
): ColumnsType<DataTransferObject> {
  const results: ColumnsType<DataTransferObject> = [];
  if (dataTransferObjects.length > 0) {
    Object.keys(dataTransferObjects[0]).forEach((key) => {
      if (
        (columnNames.length === 0 || columnNames.includes(key)) &&
        !dataTransfersConfig.ignoreColumns.includes(key)
      ) {
        results.push({
          title: getMappedColumnName(key),
          dataIndex: key,
          key,
          sorter: !dataTransfersConfig.nonSortableColumns.includes(key)
            ? (a, b) => (a[key] < b[key] ? -1 : 1)
            : false,
          onFilter: (value, record) => record[key]?.includes(value),
          width: key === 'status' ? 70 : undefined,
          render: (value) => {
            if (key === 'status') {
              let color = Colors['greyscale-grey3'].hex();
              if (value === apiStatuses.Failed) {
                color = Colors.danger.hex();
              } else if (value === apiStatuses.Succeeded) {
                color = Colors.success.hex();
              } else if (value === apiStatuses.InProgress) {
                color = Colors.yellow.hex();
              }
              return <StatusDot bgColor={color} />;
            }
            if (key === 'id') {
              return value;
            }
            return getFormattedTimestampOrString(value);
          },
        });
      }
    });
  }
  return results;
}
