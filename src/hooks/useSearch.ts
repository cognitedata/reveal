import { useCallback, useState } from 'react';
import debounce from 'lodash/debounce';

type UseSearchObject<T, Q> = {
  searchResults: T[];
  searchFunction: (query: Q) => void;
  isSearching: boolean;
  clearResults: () => void;
};

type SearchFunction<T, Q> = (query: Q) => Promise<{ items: T[] }>;

export default <T, Q>(
  search: SearchFunction<T, Q>,
  debounceTimeout: number = 300
): UseSearchObject<T, Q> => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<T[]>([]);

  const debouncedSearchFunction = useCallback(
    debounce(async (query: Q) => {
      const { items: results } = await search(query);
      setSearchResults(results);
      setIsSearching(false);
    }, debounceTimeout),
    [debounceTimeout]
  );

  const searchFunction = (query: Q) => {
    setIsSearching(true);
    return debouncedSearchFunction(query);
  };

  const clearResults = () => setSearchResults([]);

  return {
    searchResults,
    searchFunction,
    isSearching,
    clearResults,
  };
};
