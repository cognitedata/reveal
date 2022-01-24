import { CogniteClient } from '@cognite/sdk';
import { DataSetId, EquipmentData } from 'scarlet/types';

export const saveEquipment = async (
  client: CogniteClient,
  {
    unitName,
    equipmentName,
    equipment,
  }: { unitName: string; equipmentName: string; equipment: EquipmentData }
): Promise<boolean> => {
  const id = [unitName, equipmentName, 'state'].join('_');
  try {
    await client.files.upload(
      {
        externalId: id,
        name: id,
        mimeType: 'application/json',
        dataSetId: DataSetId.P66_ScarletViewState,
        metadata: {
          unitName,
          equipmentName,
        },
        source: 'p66-scarlet-view',
      },
      JSON.stringify(equipment),
      true,
      true
    );
  } catch (e: any) {
    // this is due to outdated SDK that tries to parse response
    // as json by default, though response is empty
    if (e?.message === 'Unexpected end of JSON input') return true;
    throw e;
  }

  return true;
};
