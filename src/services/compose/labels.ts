import { CogniteClient, Label, LabelDefinition } from '@cognite/sdk';
import { LabelCount, LabelDescription } from 'src/services/types';
import { composeAggregates } from './aggregates';

/**
 * Maps the training labels with number of aggregates results: [L-1, L-2] -> { L-1: 5, L-2: 1 }
 */
export const composeLabelsCount = async (
  sdk: CogniteClient,
  trainingLabels?: Label[]
): Promise<LabelCount> => {
  const { labels } = await composeAggregates(sdk);

  const countByExternalId = new Map(
    labels.map((label) => [label.name, label.value])
  );

  return Object.fromEntries(
    (trainingLabels ?? []).map(({ externalId }) => [
      externalId,
      countByExternalId.get(externalId) ?? 0,
    ])
  );
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
