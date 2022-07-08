import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { getDateByMatchingRegex } from 'utils/date';
import { toFixedNumberFromNumber } from 'utils/number';
import { changeUnits as changeSomeUnits, UnitConverterItem } from 'utils/units';

/**
 * @deprecated - this is mega unsafe - use direct key accessor instead
 */
export const convertToFixedDecimal = <Item>(
  dataObj: Item,
  accessors: string[],
  toFixed = 2
): Item => {
  const copiedEvent = { ...dataObj };
  accessors.forEach((accessor) => {
    const numValue = Number(get(dataObj, accessor));
    if (!Number.isNaN(numValue)) {
      set(
        copiedEvent as unknown as Record<string, unknown>,
        accessor,
        toFixedNumberFromNumber(numValue, toFixed)
      );
    }
  });
  return copiedEvent;
};

export const convertTimeStampsToDates = <Item>(
  dataObj: Item,
  accessors: string[]
) => {
  const copiedEvent = { ...dataObj };
  accessors.forEach((accessor) => {
    const date = get(dataObj, accessor);
    set(
      copiedEvent as unknown as Record<string, unknown>,
      accessor,
      getDateByMatchingRegex(date)
    );
  });
  return copiedEvent;
};

export const convertObject = <Item>(object: Item) => {
  let clonedObj = cloneDeep(object);
  const allFunctions = {
    toFixedDecimals: (accessors: string[], toFixed?: number) => {
      clonedObj = convertToFixedDecimal(clonedObj, accessors, toFixed);
      return allFunctions;
    },
    toClosestInteger: (accessors: string[]) => {
      clonedObj = convertToClosestInteger(clonedObj, accessors);
      return allFunctions;
    },
    toDate: (accessors: string[]) => {
      clonedObj = convertTimeStampsToDates(clonedObj, accessors);
      return allFunctions;
    },
    changeUnits: (unitAccessors: UnitConverterItem[]) => {
      clonedObj = changeSomeUnits(clonedObj, unitAccessors);
      return allFunctions;
    },
    add: (extraValues: { [key: string]: string | number }) => {
      clonedObj = { ...clonedObj, ...extraValues };
      return allFunctions;
    },
    get: () => clonedObj,
  };
  return allFunctions;
};

export const convertToClosestInteger = <Item>(
  event: Item,
  accessors: string[]
) => {
  const copiedEvent = { ...event };
  accessors.forEach((accessor) => {
    const numValue = Number(get(event, accessor));
    if (Number.isNaN(numValue)) {
      set(copiedEvent as unknown as Record<string, unknown>, accessor, '');
    } else {
      set(
        copiedEvent as unknown as Record<string, unknown>,
        accessor,
        numValue.toFixed(0)
      );
    }
  });
  return copiedEvent;
};
