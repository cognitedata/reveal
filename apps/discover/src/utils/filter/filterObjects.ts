import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import { toBooleanMap } from 'utils/booleanMap';

export const filterObjects = <
  ObjectType extends object,
  ValueType extends string | number
>(
  items: ObjectType[],
  filters: ValueType[],
  accessor: DeepKeyOf<ObjectType>
) => {
  const filtersBooleanMap = toBooleanMap(filters);

  return items.filter((item) => {
    const value = get(item, accessor);
    return !isUndefined(value) && Boolean(filtersBooleanMap[value]);
  });
};
