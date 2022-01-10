import convert from 'convert-units';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { log } from 'utils/log';

import { UNITS_TO_STANDARD } from './constants';
import { UnitConverterItem } from './interfaces';

export const changeUnits = <Item>(
  item: Item,
  unitAccessors: UnitConverterItem[]
): Item => {
  let convertedObj = cloneDeep(item);
  unitAccessors.forEach((accessorObj: UnitConverterItem) => {
    convertedObj = changeUnit(convertedObj, accessorObj);
  });
  return convertedObj;
};

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

export const changeUnitTo = (
  value: number,
  fromUnit: string,
  toUnit: string
) => {
  const standardFromUnit = get(UNITS_TO_STANDARD, fromUnit || '');
  let convertedValue;
  try {
    convertedValue = convert(Number(value))
      .from(standardFromUnit || fromUnit)
      .to(toUnit as any);
  } catch (e) {
    log(String(e));
  }
  return convertedValue;
};
