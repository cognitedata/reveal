import isString from 'lodash/isString';

import { ColumnType } from 'components/Tablev3';

export type ColumnMap<Row> = Record<string, ColumnType<Row>>;
export const getAvailableColumns = <Row>(columnMap: ColumnMap<Row>) =>
  Object.entries(columnMap).map(([field, column]) => {
    return {
      ...column,
      name: isString(column.Header) ? column.Header : column.title || '',
      field,
      selected: false,
      disabled: false,
    };
  });
