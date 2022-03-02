import convert from 'convert-units';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { log } from 'utils/log';

import { UNITS_TO_STANDARD } from './constants';

export interface UnitConverterItem {
  accessor: string;
  from?: string;
  // we should be using this:
  // from?: convert.Unit;
  fromAccessor?: string;
  id?: string;
  errorHandler?: (err: string) => void;
  to: string;
  // we should be using this:
  // to: convert.Unit;
}
export const changeUnit = <Item>(
  item: Item,
  unitAccessorsObj: UnitConverterItem
): Item => {
  const convertedObj = cloneDeep(item);
  const { accessor, fromAccessor, from, to, errorHandler, id } =
    unitAccessorsObj;
  const value = get(item, accessor);
  const rowId = get(item, id || '');
  const fromUnit = get(item, fromAccessor || '') || from;
  const standardFromUnit = get(UNITS_TO_STANDARD, fromUnit || '');
  if (value !== undefined && fromUnit && to) {
    let convertedValue;
    try {
      convertedValue = convert(Number(value))
        .from(standardFromUnit || fromUnit)
        .to(to as any);
    } catch (e) {
      if (errorHandler)
        errorHandler(
          `{rowId: ${rowId}, accessor: ${accessor}, message: ${e} }`
        );
      else log(String(e));

      return convertedObj;
    }
    if (convertedValue !== undefined) {
      set(
        convertedObj as unknown as Record<string, unknown>,
        accessor,
        convertedValue
      );
    }
  }
  return convertedObj;
};
