import { CogniteClient } from '@cognite/sdk';
import { transformScannerDetection } from 'scarlet/transformations';
import { DataSetId, ScannerDetection } from 'scarlet/types';

export const getScannerDetections = async (
  client: CogniteClient,
  { unitName, equipmentName }: { unitName: string; equipmentName: string }
): Promise<ScannerDetection[]> => {
  const file = await client.files
    .list({
      filter: {
        externalIdPrefix: `dev_${unitName}_${equipmentName}`,
        dataSetIds: [{ id: DataSetId.P66_ScarletScannerResults }],
      },
    })
    .then((response) => response.items.pop());

  if (!file) return Promise.resolve([]);

  const url = await client.files
    .getDownloadUrls([{ id: file.id }])
    .then((response) => response[0].downloadUrl);

  const data = await fetch(url)
    .then((response) => response.json())
    .then((response) => response.detections.shift() || []);

  return data.map(transformScannerDetection);
};
