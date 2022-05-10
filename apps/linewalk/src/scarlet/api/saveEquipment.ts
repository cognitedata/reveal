import { CogniteClient } from '@cognite/sdk';
import { DataSetId, EquipmentData, Facility } from 'scarlet/types';
import { getEquipmentProgress } from 'scarlet/utils';
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

  const fileParts = [
    config.env,
    facility.sequenceNumber,
    unitId,
    equipmentId,
    'state',
  ];

  const id = fileParts.join('_');

  try {
    await client.files.upload(
      {
        externalId: id,
        name: `${id}.json`,
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
