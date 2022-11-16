import { FileInfo } from '@cognite/sdk';
import { ContainerType } from '@cognite/unified-file-viewer';
import {
  PREVIEWABLE_IMAGE_TYPES,
  PREVIEWABLE_DOCUMENT_TYPES,
} from 'components/FileList/utils';

// this will soon replaced by UFV built in utility
export const mapContainerToMimeType = (file: FileInfo | undefined) => {
  const { mimeType = '', name = '' } = file ?? {};
  const query = mimeType + name.slice(0, name.lastIndexOf('.'));

  if (PREVIEWABLE_IMAGE_TYPES.some((el) => query.includes(el))) {
    return ContainerType.IMAGE;
  }
  if (PREVIEWABLE_DOCUMENT_TYPES.some((el) => query.includes(el))) {
    return ContainerType.DOCUMENT;
  }
  return ContainerType.IMAGE;
};
