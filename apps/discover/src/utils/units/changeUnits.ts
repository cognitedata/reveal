import cloneDeep from 'lodash/cloneDeep';

import { UnitConverterItem, changeUnit } from './changeUnit';

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
