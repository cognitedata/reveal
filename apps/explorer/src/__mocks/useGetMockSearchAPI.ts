import { GetSearchDataQueryTypeGenerated } from 'graphql/generated';
import { useEffect, useState } from 'react';
import { getMockSearchAPI } from '__mocks/mockSearchAPIData';

export const useGetMockSearchAPI = (): GetSearchDataQueryTypeGenerated => {
  const [searchResults, setSearchResults] = useState<Record<string, any>>({});
  useEffect(() => {
    const fetchData = async () => {
      const apiCallData = await getMockSearchAPI();
      setSearchResults(apiCallData.data);
    };
    fetchData();
  }, []);

  return searchResults;
};
