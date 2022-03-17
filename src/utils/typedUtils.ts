import handleError from './handleError';

export const stringContains = (value?: string, searchText?: string) => {
  if (!searchText || searchText === '') {
    return true;
  }
  try {
    return value && value.toUpperCase().search(searchText.toUpperCase()) >= 0;
  } catch (e) {
    handleError(e);
    return undefined;
  }
};
