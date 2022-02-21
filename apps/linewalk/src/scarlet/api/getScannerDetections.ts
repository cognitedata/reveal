import { CogniteClient } from '@cognite/sdk';
import { transformScannerDetection } from 'scarlet/transformations';
import { DataSetId, Detection } from 'scarlet/types';

export const getScannerDetections = async (
  client: CogniteClient,
  { unitName, equipmentName }: { unitName: string; equipmentName: string }
): Promise<Detection[]> => {
  const file = await client.files
    .list({
      filter: {
        externalIdPrefix: `${unitName}_${equipmentName}`,
        dataSetIds: [{ id: DataSetId.P66_ScarletScannerResults }],
      },
    })
    .then((response) =>
      response.items
        .sort(
          (a, b) =>
            parseInt(a.metadata?.scanner_version || '0', 10) -
            parseInt(b.metadata?.scanner_version || '0', 10)
        )
        ?.pop()
    );

  if (!file) return Promise.resolve([]);

  const url = await client.files
    .getDownloadUrls([{ id: file.id }])
    .then((response) => response[0].downloadUrl);

  const data = await fetch(url)
    .then((response) => response.json())
    .then((response) => response.detections.flat() || []);

  return data
    .map(transformScannerDetection)
    .filter((item: Detection) => item.value);
};
