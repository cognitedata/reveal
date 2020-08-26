import { ColumnsType } from 'antd/es/table';
import { GenericResponseObject } from '../typings/interfaces';

export function stringToBoolean(input: string): boolean | undefined {
  try {
    return JSON.parse(input.toLowerCase());
  } catch (e) {
    return undefined;
  }
}

export function generateColumnsFromResponse(
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
