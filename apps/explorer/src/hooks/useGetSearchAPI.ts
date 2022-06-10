import { useEffect, useState } from 'react';
import { getArrayOfItems } from 'utils/search';
import { SearchDataFormat } from 'utils/search/types';
import { getMockSearchAPI } from '__mocks/mockSearchAPIData';

export const useGetSearchAPI = (): SearchDataFormat[] => {
  const [searchResults, setSearchResults] = useState<Record<string, any>>({});
  useEffect(() => {
    const fetchData = async () => {
      const apiCallData = await getMockSearchAPI();
      setSearchResults(apiCallData.data);
    };
    fetchData();
  }, []);

  return getArrayOfItems(searchResults);
};
