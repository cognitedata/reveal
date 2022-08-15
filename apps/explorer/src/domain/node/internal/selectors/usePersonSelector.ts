import { useGetSearchDataQuery } from 'graphql/generated';

export const usePersonSelector = ({ externalId }: { externalId?: string }) => {
  const { data, isError, isLoading } = useGetSearchDataQuery();

  if (isLoading || isError) {
    return { name: 'Unknown' };
  }

  return data?.people?.items.find(
    (person) => person?.externalId === externalId
  );
};
