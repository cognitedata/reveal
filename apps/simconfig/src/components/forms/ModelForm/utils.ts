import { CogniteClient } from '@cognite/sdk';
import { cdfUpload } from 'utils/cdfUpload';
import { Api } from '@cognite/simconfig-api-sdk';

import { FileInfo } from './types';
import { BoundaryCondition, DATA_TYPE_FILE } from './constants';

interface ModelFileProps {
  api: Api<any>;
  project: string;
  cdfClient: CogniteClient;
  file: File;
  fileInfo: FileInfo;
  boundaryConditions: (keyof typeof BoundaryCondition)[];
}

function getExternalId(fileInfo: FileInfo) {
  const sanitizeId = (id: string) => id.replace(/[^-.\w]+/g, '_');
  const fileName = fileInfo.name || 'No Name';
  return {
    file: sanitizeId(
      `${fileInfo.source}-${fileName}-${
        fileInfo.metadata?.version || 'Unknown'
      }`
    ),
    boundaryCondition: sanitizeId(`${fileInfo.source}-BC-${fileName}`),
    boundaryConditionRow: (key: string) =>
      sanitizeId(`${fileInfo.source}-BC-${key}-${fileName}`),
  };
}

export async function uploadModelFile({
  api,
  project,
  cdfClient,
  file,
  fileInfo,
  boundaryConditions,
}: ModelFileProps) {
  const externalId = getExternalId(fileInfo);
  const sanitizeName = (name: string) => name.replace(/\/|\\/g, '_');

  await cdfUpload(cdfClient, file, {
    ...fileInfo,
    name: sanitizeName(fileInfo.name),
    externalId: externalId.file,
    metadata: {
      ...fileInfo.metadata,
      modelName: fileInfo.name,
      fileName: fileInfo.metadata.fileName,
      dataType: DATA_TYPE_FILE,
    },
  });

  if (!boundaryConditions.length) {
    return;
  }

  api.files.filesCreate(project, {
    boundaryConditions,
    fileInfo,
  });
}
