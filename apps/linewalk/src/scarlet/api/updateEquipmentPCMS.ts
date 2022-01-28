import { CogniteClient } from '@cognite/sdk';

export const updateEquipmentPCMS = async (
  client: CogniteClient,
  {
    equipmentAssetExternalId,
    key,
    value,
  }: {
    equipmentAssetExternalId?: string;
    key: string;
    value: string;
  }
) => {
  if (equipmentAssetExternalId) {
    await client.assets.update([
      {
        externalId: equipmentAssetExternalId,
        update: { metadata: { add: { [key]: value }, remove: [] } },
      },
    ]);
  }
};
