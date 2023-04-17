import { CogniteClient } from '@cognite/sdk';
import { getContainerConfigFromFileInfo } from '@cognite/unified-file-viewer';
import { v4 as uuid } from 'uuid';
import { IndustryCanvasContainerConfig } from '../../types';

const resolveFileContainerConfig = async (
  sdk: CogniteClient,
  {
    id,
    resourceId,
    page,
    x,
    y,
    width,
    height,
    maxWidth,
    maxHeight,
    label,
  }: {
    id?: string | undefined;
    resourceId: number;
    page: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
    label?: string;
  }
): Promise<IndustryCanvasContainerConfig> => {
  const fileInfos = await sdk.files.retrieve([{ id: resourceId }]);

  if (fileInfos.length !== 1) {
    throw new Error('Expected to find exactly one file');
  }
  const fileInfo = fileInfos[0];
  const containerConfig = await getContainerConfigFromFileInfo(
    sdk as any,
    fileInfo,
    {
      id: id || uuid(),
      label: label ?? fileInfo.name ?? fileInfo.externalId,
      page: page,
      x: x,
      y: y,
      width: width,
      height: height,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      fontSize: 24,
    }
  );

  return {
    ...containerConfig,
    metadata: {
      resourceId,
      name: fileInfo.name,
      externalId: fileInfo.externalId,
    },
  } as IndustryCanvasContainerConfig;
};

export default resolveFileContainerConfig;
