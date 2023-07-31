import { getValueFromKey } from 'utils/getValueFromKey';

import { sortByCaseInsensitive } from './sortByCaseInsensitive';

export const sortObjectsAscending = <T>(list: T[], path: DeepKeyOf<T>) =>
  list.slice().sort((first, second) => {
    const firstValue = getValueFromKey(first, path);
    const secondValue = getValueFromKey(second, path);

    return sortByCaseInsensitive(firstValue, secondValue);
  });
