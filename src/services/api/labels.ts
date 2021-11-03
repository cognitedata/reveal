import { CogniteClient, LabelDefinition } from '@cognite/sdk';

export const fetchLabels = async (
  sdk: CogniteClient
): Promise<LabelDefinition[]> => {
  const result = await sdk.labels.list();

  return result.items;
};
