import { CogniteClient } from '@cognite/sdk';
import { transformEquipmentConfig } from 'scarlet/transformations';
import { DataSetId } from 'scarlet/types';

export const getEquipmentConfig = async (client: CogniteClient) => {
  const configFile = await client.files
    .list({
      filter: {
        externalIdPrefix: 'schema_scanner_config',
        dataSetIds: [{ id: DataSetId.P66_ScarletScannerConfiguration }],
      },
    })
    .then((response) => {
      const version = response.items
        .map((item) => {
          const match = item.externalId?.match(
            /schema_scanner_config_(\d+)\.json/
          );
          return match ? parseInt(match[1], 10) : 0;
        })
        .sort()
        .pop();
      return response.items.find(
        (item) => item.externalId === `schema_scanner_config_${version}.json`
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

  const config = await fetch(downloadUrl).then((response) => response.json());

  return transformEquipmentConfig(config);
};
