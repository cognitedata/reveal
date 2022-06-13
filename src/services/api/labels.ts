import {
  CogniteClient,
  ExternalId,
  ExternalLabelDefinition,
  LabelDefinition,
} from '@cognite/sdk';

export const fetchLabels = async (
  sdk: CogniteClient
): Promise<LabelDefinition[]> => {
  const response = sdk.labels.list();
  const result = await response.autoPagingToArray({
    limit: Infinity,
  });

  return result;
};

export const createLabel = async (
  sdk: CogniteClient,
  label: ExternalLabelDefinition
): Promise<LabelDefinition[]> => {
  const result = await sdk.labels.create([label]);

  return result;
};

export const deleteLabels = async (
  sdk: CogniteClient,
  ids: ExternalId[]
): Promise<{}> => {
  const result = await sdk.labels.delete(ids);

  return result;
};
