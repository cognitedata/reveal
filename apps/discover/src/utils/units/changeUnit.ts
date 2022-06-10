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
/**
 * @deprecated - use changeUnitTo
 * This is unsafe because the units are not typed
 * Prefer to use the changeUnitTo instead
 */
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

      /**
       * This code block was added to change the unit of the convertedObj.
       * Otherwise, the returned convertedObj has the unit before the value is converted.
       * However, this mutates the original object.
       * Hence, if the same accessor is used again , no conversion happens,
       * since the original object is mutated with thetarrgt unit.
       * This doesn't effect the app since we don't use the unit from the object directly.
       * But this should be fixed as soon as possible.
       */

      // if (fromAccessor) {
      //   set(
      //     convertedObj as unknown as Record<string, unknown>,
      //     fromAccessor,
      //     to
      //   );
      // }
    }
  }
  return convertedObj;
};
