import isEmpty from 'lodash/isEmpty';
import { includesString } from 'utils/filter/includesString';

export const filterCasingsByWellOrWellboreName = <
  T extends { wellName: string; wellboreName: string }
>(
  items: T[],
  searchPhrase: string
): T[] => {
  const searchPhraseTrimmed = searchPhrase.trim();

  if (isEmpty(searchPhraseTrimmed)) {
    return items;
  }

  return items.filter(({ wellName, wellboreName }) => {
    return (
      includesString(wellName, searchPhraseTrimmed) ||
      includesString(wellboreName, searchPhraseTrimmed)
    );
  });
};
