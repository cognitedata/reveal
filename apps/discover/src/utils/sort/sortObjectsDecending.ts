import { getValueFromKey } from 'utils/getValueFromKey';

import { sortByCaseInsensitive } from './sortByCaseInsensitive';

export const sortObjectsDecending = <T>(list: T[], path: string) =>
  list.slice().sort((first, second) => {
    const firstValue = getValueFromKey(first, path);
    const secondValue = getValueFromKey(second, path);

    return sortByCaseInsensitive(secondValue, firstValue);
  });
