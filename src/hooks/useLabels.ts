import { ExternalLabelDefinition } from '@cognite/sdk';
import { useLabelsQuery } from 'src/services/query/labels/query';

export const useLabels = (externalIds: string[]) => {
  const { data, isLoading } = useLabelsQuery();
  const externalIdToLabel = new Map(
    data.map((label) => [label.externalId, label])
  );

  const labels: ExternalLabelDefinition[] = externalIds.map((externalId) => {
    const label = externalIdToLabel.get(externalId);
    return {
      externalId,
      name: label?.name || externalId,
      description: label?.description,
    };
  });

  return { labels, isLoading };
};
