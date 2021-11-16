import { CogniteClient, Label, LabelDefinition } from '@cognite/sdk';
import { LabelCount, LabelDescription } from 'services/types';
import { composeAggregates } from './aggregates';

/**
 * Maps the training labels with number of aggregates results: [L-1, L-2] -> { L-1: 5, L-2: 1 }
 */
export const composeLabelsCount = async (
  sdk: CogniteClient,
  trainingLabels?: Label[]
): Promise<LabelCount> => {
  const { labels } = await composeAggregates(sdk);

  const labelCounts = (trainingLabels || []).reduce(
    (accumulator, { externalId }) => {
      const aggregate = labels.find((item) => item.name === externalId);

      // TODO(DEMO-1): Search in the label aggregate for count if labels counts are undefined (for now show, -1)
      // const aggregatedFiles = await fetchFilesAggregate(
      //   sdk,
      //   classifier?.trainingLabels
      // );

      return { ...accumulator, [externalId]: aggregate?.value || 0 };
    },
    {} as LabelCount
  );

  return labelCounts;
};

export const composeLabelsDescription = async (
  labels: LabelDefinition[],
  trainingLabels?: Label[]
): Promise<LabelDescription> => {
  return (trainingLabels || []).reduce((accumulator, { externalId }) => {
    const matchingLabel = labels.find((item) => item.externalId === externalId);

    return {
      ...accumulator,
      [externalId]: matchingLabel?.description,
    };
  }, {} as LabelDescription);
};
