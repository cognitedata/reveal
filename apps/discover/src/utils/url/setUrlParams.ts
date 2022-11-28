import { useHistory } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';
import without from 'lodash/without';

import { getSearchParamsFromCurrentUrl } from './getSearchParamsFromCurrentUrl';

const getPrefix = (searchParams: string) => {
  return searchParams === '' ? '' : '&';
};

export const useSetUrlParams = () => {
  const history = useHistory();

  return (
    search: string,
    options: { preserveKeys?: string[]; preserveKeyFilters?: string[] } = {
      preserveKeys: [],
      preserveKeyFilters: [],
    }
  ) => {
    let searchParams = '';

    const params = getSearchParamsFromCurrentUrl();
    let unprocessedKeys = Object.keys(params);

    if (options.preserveKeys && options.preserveKeys.length > 0) {
      const params = getSearchParamsFromCurrentUrl();

      options.preserveKeys.forEach((key) => {
        if (params[key]) {
          unprocessedKeys = without(unprocessedKeys, 'key');

          searchParams += `${getPrefix(searchParams)}${key}=${params[key]}`;
        }
      });
    }

    const { preserveKeyFilters } = options;
    if (preserveKeyFilters && preserveKeyFilters.length > 0) {
      unprocessedKeys.forEach((param) => {
        const shouldKeep = preserveKeyFilters.find((key) => {
          return param.startsWith(key);
        });
        if (shouldKeep !== undefined) {
          searchParams += `${getPrefix(searchParams)}${param}=${params[param]}`;
        }
      });
    }

    if (!isEmpty(search.trim())) {
      searchParams += `${getPrefix(searchParams)}${search}`;
    }

    history.replace({
      search: searchParams,
    });
  };
};
