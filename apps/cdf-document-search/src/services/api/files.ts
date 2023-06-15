import { CogniteClient, FileAggregate, Label } from '@cognite/sdk';

export const fetchFilesAggregate = (
  sdk: CogniteClient,
  trainingLabels?: Label[]
): Promise<FileAggregate[]> => {
  if (!trainingLabels) {
    return Promise.resolve([]);
  }

  return sdk.files.aggregate({
    filter: {
      labels: {
        containsAny: trainingLabels,
      },
    },
  });
};

export const updateFileLabels = (
  sdk: CogniteClient,
  action: 'add' | 'remove',
  label: Label,
  documentIds: number[]
) => {
  const updatingDocuments = documentIds.map((id) => ({
    id,
    update: {
      labels: {
        [action]: [label],
      },
    },
  }));

  return sdk.files.update(updatingDocuments);
};
