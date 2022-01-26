import { CogniteClient } from '@cognite/sdk';
import { DataSetId } from 'scarlet/types';

export const getEquipmentState = async (
  client: CogniteClient,
  { unitName, equipmentName }: { unitName: string; equipmentName: string }
): Promise<any> => {
  const file = await client.files
    .list({
      filter: {
        externalIdPrefix: `${unitName}_${equipmentName}`,
        dataSetIds: [{ id: DataSetId.P66_ScarletViewState }],
      },
    })
    .then((response) => response.items.pop());

  if (!file) return Promise.resolve();

  const url = await client.files
    .getDownloadUrls([{ id: file.id }])
    .then((response) => response[0].downloadUrl);

  const data = await fetch(url).then((response) => response.json());

  // await client.files.delete([{ id: file.id }]);

  return data;
};
