import { format } from 'date-fns';
import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { Colors, TableProps } from '@cognite/cogs.js';
import { apiStatuses } from 'utils/statuses';
import capitalize from 'lodash/capitalize';

import configurationsConfig from '../Configurations/configs/configurations.config';

import dataTransfersConfig from './datatransfer.config';
import { StatusDot } from './elements';
import { DataTypesTableData } from './types';
import { SelectColumnFilter } from './components/Table/Filters/SelectColumnFilter';

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

  return capitalize(colName);
};

export function selectColumns(
  dataTransferObjects: DataTypesTableData[],
  columnNames: string[]
): TableProps<DataTypesTableData>['columns'] {
  const results: TableProps<DataTypesTableData>['columns'] = [];

  if (dataTransferObjects?.length === 0) return [];

  const keys = Object.keys(
    dataTransferObjects[0]
  ) as (keyof DataTypesTableData)[];

  if (dataTransferObjects.length > 0) {
    keys.forEach((key) => {
      if (
        (columnNames.length === 0 || columnNames.includes(key)) &&
        !dataTransfersConfig.ignoreColumns.includes(key)
      ) {
        if (key === 'report') {
          results.push({
            Header: getMappedColumnName(key),
            accessor: key,
            disableSortBy: true,
            Cell: ({ value }: { value: any }) => {
              return getFormattedTimestampOrString(value);
            },
            Filter: SelectColumnFilter,
            filter: 'includes',
          });

          return;
        }

        results.push({
          Header: getMappedColumnName(key),
          accessor: key,
          disableSortBy: dataTransfersConfig.nonSortableColumns.includes(key),
          // onFilter: (value, record) => record[key]?.includes(value),
          width: key === 'status' ? 70 : undefined,
          Cell: ({ value }: { value: any }) => {
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
