import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import { DataSetId, EquipmentData } from 'scarlet/types';
import { getEquipmentProgress } from 'scarlet/utils';
import config from 'utils/config';

const isDevelopment = config.env === 'development';

export const saveEquipment = async (
  client: CogniteClient,
  {
    unitName,
    equipmentName,
    equipment,
    authState,
  }: {
    unitName: string;
    equipmentName: string;
    equipment: EquipmentData;
    authState: AuthenticatedUser;
  }
): Promise<boolean> => {
  const fileParts = [unitName, equipmentName, 'state'];

  if (isDevelopment) {
    fileParts.unshift('dev');
  }

  const id = fileParts.join('_');

  try {
    await client.files.upload(
      {
        externalId: id,
        name: `${id}.json`,
        mimeType: 'application/json',
        dataSetId: DataSetId.P66_ScarletViewState,
        metadata: {
          unitName,
          equipmentName,
          completed: equipment.isApproved ? 'Y' : 'N',
          progress: getEquipmentProgress(equipment)?.toString() || '',
          modifiedBy: authState.email ?? '',
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
