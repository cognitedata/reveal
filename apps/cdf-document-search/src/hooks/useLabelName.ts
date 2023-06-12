import { useLabelsQuery } from 'apps/cdf-document-search/src/services/query/labels/query';

export const useLabelName = (externalId: string) => {
  const { data, isLoading } = useLabelsQuery();

  const label = data.find((item) => item.externalId === externalId);

  return { labelName: label?.name || externalId, isLoading };
};
