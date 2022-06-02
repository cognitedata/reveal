import { CogniteClient } from '@cognite/sdk';
import { DataSetId, EquipmentData, Facility } from 'scarlet/types';
import {
  getEquipmentProgress,
  getEquipmentStateExternalId,
  getEquipmentToSave,
} from 'scarlet/utils';
import config from 'utils/config';

export const saveEquipment = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
    equipment,
    modifiedBy = '',
  }: {
    facility?: Facility;
    unitId: string;
    equipmentId: string;
    equipment: EquipmentData;
    modifiedBy?: string;
  }
): Promise<boolean> => {
  if (!facility) throw Error('Facility is not set');

  const externalId = getEquipmentStateExternalId(facility, unitId, equipmentId);

  try {
    await client.files.upload(
      {
        externalId,
        name: `${externalId}.json`,
        mimeType: 'application/json',
        dataSetId: DataSetId.P66_ScarletViewState,
        metadata: {
          env: config.env,
          facilitySeqNo: facility.sequenceNumber,
          unitId,
          equipmentId,
          progress: getEquipmentProgress(equipment)?.toString() || '',
          modifiedBy,
        },
        source: 'p66-scarlet-view',
      },
      JSON.stringify(getEquipmentToSave(equipment)),
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
