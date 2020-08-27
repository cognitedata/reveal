import { ColumnsType, ColumnType } from 'antd/es/table';
import { GenericResponseObject, Rule } from '../typings/interfaces';

export function stringToBoolean(input: string): boolean | undefined {
  try {
    return JSON.parse(input.toLowerCase());
  } catch (e) {
    return undefined;
  }
}

export function generateColumnsFromData(
  response: GenericResponseObject[]
): ColumnsType<GenericResponseObject> | undefined {
  const results: ColumnsType<GenericResponseObject> = [];

  if (response.length === 0) return undefined;

  Object.keys(response[0]).forEach((key) => {
    results.push({
      title: key,
      dataIndex: key,
      key,
    });
  });

  return results;
}

export function curateColumns(
  columns: ColumnsType<GenericResponseObject> | undefined,
  rules: any
) {
  if (columns) {
    const tmp = columns;
    rules.map((rule: Rule) => {
      const index = columns.findIndex(
        (column: ColumnType<any>) => column.key === rule.key
      );
      tmp[index].render = rule.render;
      return null;
    });
    return tmp;
  }
  return [];
}
