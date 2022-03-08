import { CogniteClient } from '@cognite/sdk';
import { DataSetId, UnitData } from 'scarlet/types';
import config from 'utils/config';

const isDevelopment = config.env === 'development';

export const saveUnitState = async (
  client: CogniteClient,
  { unitName, unitState }: { unitName: string; unitState: UnitData }
): Promise<boolean> => {
  const fileParts = [unitName, 'state'];

  if (isDevelopment) {
    fileParts.unshift('dev');
  }

  const id = fileParts.join('_');

  try {
    await client.files.upload(
      {
        externalId: id,
        name: id,
        mimeType: 'application/json',
        dataSetId: DataSetId.P66_ScarletViewState,
        metadata: {
          unitName,
        },
        source: 'p66-scarlet-view',
      },
      JSON.stringify(unitState),
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
