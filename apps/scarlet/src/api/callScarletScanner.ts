import { CogniteClient } from '@cognite/sdk';
import { DataSetId } from 'types';

export const callScarletScanner = async (client: CogniteClient) => {
  try {
    const files = await client.files.list({
      filter: {
        externalIdPrefix: 'Sweeny',
        dataSetIds: [{ id: DataSetId.P66_EquipmentScans }],
      },
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const file of files.items) {
      // eslint-disable-next-line no-await-in-loop
      await client.post(
        `/api/playground/projects/${client.project}/context/forms/scan`,
        {
          data: {
            items: [{ fileId: file.id }],
          },
        }
      );
    }
  } catch (e) {
    console.error('Failed executing scans on U1 documents', e);
  }
};
