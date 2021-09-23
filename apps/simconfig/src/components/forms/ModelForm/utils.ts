import { CogniteClient, SequenceValueType } from '@cognite/sdk';
import { cdfUpload } from 'utils/cdfUpload';

import {
  BoundaryCondition,
  DATA_TYPE_FILE,
  DATA_TYPE_SEQUENCE,
} from './constants';
import { FileInfo } from './types';

interface ModelFileProps {
  cdfClient: CogniteClient;
  file: File;
  fileInfo: FileInfo;
  boundaryConditions: BoundaryCondition[];
}

function getExternalId(fileInfo: FileInfo) {
  const fileName = fileInfo.name || 'No Name';
  const sanitizeId = (id: string) => id.replace(/[^-.\w]+/g, '_');
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
  cdfClient,
  file,
  fileInfo,
  boundaryConditions,
}: ModelFileProps) {
  const externalId = getExternalId(fileInfo);

  await cdfUpload(cdfClient, file, {
    ...fileInfo,
    externalId: externalId.file,
    metadata: {
      ...fileInfo.metadata,
      dataType: DATA_TYPE_FILE,
    },
  });

  if (!boundaryConditions.length) {
    return;
  }

  const sequences = [
    {
      externalId: externalId.boundaryCondition,
      dataSetId: fileInfo.dataSetId,
      name: `${fileInfo.name} - ${fileInfo.source} boundary conditions`,
      metadata: {
        dataType: DATA_TYPE_SEQUENCE,
        modelName: fileInfo.name,
        unitSystem: fileInfo.metadata.unitSystem,
      },
      columns: [
        {
          externalId: 'boundary-condition',
          name: 'Boundary condition',
          valueType: SequenceValueType.STRING,
        },
        {
          externalId: 'time-series',
          name: 'Time series',
          valueType: SequenceValueType.STRING,
        },
      ],
    },
  ];

  const createdSequence = await cdfClient.sequences.create(sequences);
  const { id } = createdSequence[0];
  let rowNumber = 0;
  const sequenceData = [
    {
      id,
      columns: ['boundary-condition', 'time-series'],
      rows: Object.values(boundaryConditions).map((key) => {
        rowNumber += 1;
        return {
          rowNumber,
          values: [key, externalId.boundaryConditionRow(key)],
        };
      }),
    },
  ];

  await cdfClient.sequences.insertRows(sequenceData);
}
