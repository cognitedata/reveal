import { useGetMapDataQuery, useGetSearchDataQuery } from 'graphql/generated';

export const useGetMapAndSearchData = () => {
  const { data: mapData, isLoading: mapIsLoading } = useGetMapDataQuery(
    {},
    {
      staleTime: Infinity,
    }
  );
  const { data: searchData, isLoading: searchIsLoading } =
    useGetSearchDataQuery(
      {},
      {
        staleTime: Infinity,
      }
    );

  return { mapData, searchData, isLoading: searchIsLoading || mapIsLoading };
};
