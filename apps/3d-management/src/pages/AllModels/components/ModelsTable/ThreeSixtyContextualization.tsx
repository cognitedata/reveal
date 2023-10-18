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
const RUN_ASSET_TAG_DETECTION_LABEL = 'run_asset_tag_detection';
const FINISHED_ASSET_TAG_DETECTION_LABEL = 'asset_tag_detection_finished';
const ASSET_TAG_NOT_DETECTED_LABEL = 'ASSET_TAG_NOT_DETECTED';
const ASSET_TAG_DETECTED_LABEL = 'ASSET_TAG_DETECTED';
const API_TIMEOUT_EXTRACT_ASSET_TAG_LABEL = 'API_TIMEOUT_EXTRACT_ASSET_TAG';

const BATCH_SIZE = 1000;
const VALID_FILE_EXTENSIONS = ['jpg', 'png', 'jpeg'];

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
  labelIds,
}: {
  sdk: CogniteClient;
  labelIds: string[];
}) => {
  const missingLabels: ExternalLabelDefinition[] = [];
  for (const labelId of labelIds) {
    if (await checkIfLabelExists({ sdk, labelId: labelId })) {
      return;
    }
    const label: ExternalLabelDefinition = {
      externalId: labelId,
      name: labelId,
    };
    missingLabels.push(label);
  }

  await sdk.labels.create(missingLabels);
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
      const addLabelsList: Label[] = [];
      const removeLabelsList: Label[] = [];
      for (const label of labels) {
        label === RUN_ASSET_TAG_DETECTION_LABEL
          ? addLabelsList.push({
              externalId: label,
            })
          : removeLabelsList.push({
              externalId: label,
            });
      }
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
              add: addLabelsList,
              remove: removeLabelsList,
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

const isFileExtensionValid = ({ fileName }: { fileName: string }) => {
  const lowerCaseFilename = fileName.toLowerCase();
  return VALID_FILE_EXTENSIONS.some((extension) =>
    lowerCaseFilename.endsWith(`.${extension}`)
  );
};

export const areAllFileExtensionsValid = ({ files }: { files: FileInfo[] }) => {
  return files.every((file) => isFileExtensionValid({ fileName: file.name }));
};

export const updateFilesMetadataFor360Contextualization = async ({
  sdk,
  selectedResourceItem,
  selectedImage360Collection,
  handleInvalidFileExtensions,
}: {
  sdk: CogniteClient;
  selectedResourceItem: ResourceItem;
  selectedImage360Collection: string;
  handleInvalidFileExtensions: () => void;
}) => {
  createMissingLabels({
    sdk,
    labelIds: [
      RUN_ASSET_TAG_DETECTION_LABEL,
      FINISHED_ASSET_TAG_DETECTION_LABEL,
      ASSET_TAG_DETECTED_LABEL,
      ASSET_TAG_NOT_DETECTED_LABEL,
      API_TIMEOUT_EXTRACT_ASSET_TAG_LABEL,
    ],
  });

  const filesList = await getFilesFrom360ImageCollection({
    sdk,
    siteId: selectedImage360Collection,
  });

  const areFileExtensionsValid = areAllFileExtensionsValid({
    files: filesList,
  });

  if (!areFileExtensionsValid) {
    handleInvalidFileExtensions();
    return;
  }
  updateFilesMetadata({
    sdk,
    files: filesList,
    labels: [
      RUN_ASSET_TAG_DETECTION_LABEL,
      FINISHED_ASSET_TAG_DETECTION_LABEL,
      ASSET_TAG_DETECTED_LABEL,
      ASSET_TAG_NOT_DETECTED_LABEL,
      API_TIMEOUT_EXTRACT_ASSET_TAG_LABEL,
    ],
    assetId: selectedResourceItem.id,
  });
};
