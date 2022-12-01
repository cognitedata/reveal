import { CogniteClient } from '@cognite/sdk';
import { datasetByProject } from 'config';
import { Facility } from 'types';
import config from 'utils/config';

export const getEquipmentState = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
  }: { facility?: Facility; unitId: string; equipmentId: string }
): Promise<any> => {
  if (!facility) throw Error('Facility is not set');
  const dataSet = datasetByProject(client.project);

  try {
    const file = await client.files
      .list({
        filter: {
          dataSetIds: [{ id: dataSet.P66_ScarletEquipmentState }],
          metadata: {
            env: config.env,
            facilityId: facility.id,
            unitId,
            equipmentId,
          },
        },
      })
      .then((response) => response.items.pop());

    if (!file) return Promise.resolve();

    // await client.files.delete([{ id: file.id }]);

    const url = await client.files
      .getDownloadUrls([{ id: file.id }])
      .then((response) => response[0].downloadUrl);

    const data = await fetch(url).then((response) => response.json());
    return data;
  } catch (error: any) {
    if (error?.message?.includes('Files not uploaded')) return undefined;
    throw error;
  }
};
