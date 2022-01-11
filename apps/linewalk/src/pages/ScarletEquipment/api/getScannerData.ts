import { CogniteClient } from '@cognite/sdk';

import { DataSetId, ScannerData } from '../types';

export const getScannerData = async (
  client: CogniteClient,
  unitName: string,
  equipmentName: string
): Promise<ScannerData> => {
  const list = await client.files.list({
    filter: {
      externalIdPrefix: `${unitName}_${equipmentName}`,
      dataSetIds: [{ id: DataSetId.P66_ScarletScannerResults }],
    },
  });

  if (!list.items.length) return Promise.resolve(undefined);

  const url = await client.files
    .getDownloadUrls([{ id: list.items[0].id }])
    .then((response) => response[0].downloadUrl);

  const data = await fetch(url).then((response) => response.json());

  return data as ScannerData;
};
