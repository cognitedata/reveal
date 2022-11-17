import { useSearchParams } from 'react-router-dom';
import { omit } from 'lodash';

export const useSearchParam = (
  name: string
): [string | undefined, (s?: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get(name);

  const setSearchParam = (newSearchParam?: string) => {
    /**
     * To avoid updating to stale values we must
     * use window.location here, and not the cached location
     * from the useLocation hook
     */
    const newSearch = newSearchParam
      ? {
          ...searchParams,
          [name]: encodeURIComponent(newSearchParam),
        }
      : omit(searchParams, name);

    setSearchParams(newSearch);
  };

  return [
    searchParam ? decodeURIComponent(searchParam) : undefined,
    setSearchParam,
  ];
};

export const useClearSearchParams = (keys: string[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const clearSearchParams = () => {
    keys.forEach((key) => {
      searchParams.delete(key);
      setSearchParams(searchParams);
    });
  };

  return clearSearchParams;
};
