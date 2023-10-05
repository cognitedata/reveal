import { chunk } from 'lodash';
import range from 'lodash/range';

import {
  CogniteClient,
  ExternalLabelDefinition,
  FileInfo,
  FileChangeUpdateById,
  Label,
  MetadataPatch,
} from '@cognite/sdk/dist/src';

import { ResourceItem } from '@data-exploration-lib/core';
const ASSET_TAG_DETECTION_LABEL = 'run_asset_tag_detection';
const BATCH_SIZE = 1000;
const checkIfLabelExists = async ({
  sdk,
  labelId,
}: {
  sdk: CogniteClient;
  labelId: string;
}) => {
  const labels = await sdk.labels.list({
    filter: { externalIdPrefix: labelId },
  });
  return labels.items.some((label) => label.externalId === labelId);
};

const createMissingLabels = async ({
  sdk,
  labelId,
}: {
  sdk: CogniteClient;
  labelId: string;
}) => {
  if (await checkIfLabelExists({ sdk, labelId })) {
    return;
  }
  const label: ExternalLabelDefinition = {
    externalId: labelId,
    name: labelId,
  };
  await sdk.labels.create([label]);
};

const getFilesFrom360ImageCollection = async ({
  sdk,
  siteId,
}: {
  sdk: CogniteClient;
  siteId: string;
}) => {
  const partitions = 10;
  const partitionedRequests = range(1, partitions + 1).flatMap(
    async (index) => {
      const requestFilter = {
        filter: {
          metadata: {
            site_id: siteId,
            image_type: 'cubemap',
          },
        },
        limit: 1000,
        partition: `${index}/${partitions}`,
      };
      return sdk.files
        .list(requestFilter)
        .autoPagingToArray({ limit: Infinity });
    }
  );

  const filesList = await Promise.all(partitionedRequests);
  return filesList.flat();
};

const updateFilesMetadata = async ({
  sdk,
  files,
  labels,
  assetId,
}: {
  sdk: CogniteClient;
  files: FileInfo[];
  labels: string[];
  assetId: number;
}) => {
  const chunkedFileInfo = chunk(files, BATCH_SIZE);
  await Promise.all(
    chunkedFileInfo.map(async (fileInfo) => {
      const fileIds: number[] = fileInfo.map((file) => file.id);
      const labelsList: Label[] = labels.map((label) => {
        return {
          externalId: label,
        };
      });
      const metadataUpdate: MetadataPatch = {
        add: {
          parent_asset_id: assetId.toString(),
        },
        remove: [''],
      };
      const filesUpdate: FileChangeUpdateById[] = fileIds.map((fileId) => {
        return {
          id: fileId,
          update: {
            labels: {
              add: labelsList,
            },
            metadata: metadataUpdate,
          },
        };
      });
      if (filesUpdate.length === 0) {
        return;
      }
      await sdk.files.update(filesUpdate);
    })
  );
};

export const updateFilesMetadataFor360Contextualization = async ({
  sdk,
  selectedResourceItem,
  selectedImage360Collection,
}: {
  sdk: CogniteClient;
  selectedResourceItem: ResourceItem;
  selectedImage360Collection: string;
}) => {
  createMissingLabels({ sdk, labelId: ASSET_TAG_DETECTION_LABEL });

  const filesList = await getFilesFrom360ImageCollection({
    sdk,
    siteId: selectedImage360Collection,
  });

  updateFilesMetadata({
    sdk,
    files: filesList,
    labels: [ASSET_TAG_DETECTION_LABEL],
    assetId: selectedResourceItem.id,
  });
};
