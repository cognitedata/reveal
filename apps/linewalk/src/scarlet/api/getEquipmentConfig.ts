import { CogniteClient } from '@cognite/sdk';
import { transformEquipmentConfig } from 'scarlet/transformations';
import { DataSetId } from 'scarlet/types';
import config from 'utils/config';

export const getEquipmentConfig = async (client: CogniteClient) => {
  const externalIdPrefix = ['schema', 'scanner', 'config', config.env].join(
    '_'
  );
  const configFile = await client.files
    .list({
      filter: {
        externalIdPrefix,
        dataSetIds: [{ id: DataSetId.P66_ScarletScannerConfiguration }],
      },
      limit: 1000,
    })
    .then((response) => {
      const version = response.items
        .map((item) => {
          const match = item.externalId?.match(
            new RegExp(`^${externalIdPrefix}_(\\d+)\\.json$`)
          );
          return match ? parseInt(match[1], 10) : 0;
        })
        .sort((a, b) => a - b)
        .pop();
      return response.items.find(
        (item) => item.externalId === `${externalIdPrefix}_${version}.json`
      );
    });

  if (!configFile)
    throw Error(
      `Failed to load equipment-configuration file with data-set-id: ${DataSetId.P66_ScarletScannerConfiguration}`
    );

  const downloadUrl = await client.files
    .getDownloadUrls([{ id: configFile.id }])
    .then((response) =>
      response.length ? response[0].downloadUrl : undefined
    );

  if (!downloadUrl)
    throw Error(
      `Failed to load download-url of equipment-configuration with internal-id: ${configFile.id}`
    );

  const equipmentConfig = await fetch(downloadUrl).then((response) =>
    response.json()
  );

  return transformEquipmentConfig(equipmentConfig);
};
