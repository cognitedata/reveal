import { CogniteClient, Label, LabelDefinition } from '@cognite/sdk';
import { LabelCount, LabelDescription } from 'src/services/types';

export const getLabelCount = async (
  sdk: CogniteClient,
  externalId: string
): Promise<number> => {
  return sdk.files
    .aggregate({
      filter: {
        labels: {
          containsAny: [
            {
              externalId: externalId,
            },
          ],
        },
      },
    })
    .then((result) => {
      return result[0].count;
    });
};

/**
 * Maps the training labels with number of aggregates results: [L-1, L-2] -> { L-1: 5, L-2: 1 }
 */
export const composeLabelsCount = async (
  sdk: CogniteClient,
  trainingLabels?: Label[]
): Promise<LabelCount> => {
  var countByExternalId = new Map();
  for (var label of trainingLabels ?? []) {
    const labelCount = await getLabelCount(sdk, label.externalId);
    countByExternalId.set(label.externalId, labelCount);
  }

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
