import { useLabelsQuery } from 'services/query/labels/query';

export const useLabelName = (externalId: string) => {
  const { data } = useLabelsQuery();

  return (
    data.find((item) => item.externalId === externalId)?.name || externalId
  );
};
