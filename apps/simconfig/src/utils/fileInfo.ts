import { FileInfo as internalFileInfo } from '../components/forms/ModelForm/types';

/*
 *  Bumps version number
 *  removes unnecessary properties
 *  from FileInfo which are not accepted by upload
 * */
export const formatFileInfoForNewVersion = (
  info: internalFileInfo
): internalFileInfo => {
  const { name, metadata, mimeType, source } = info;

  return {
    name,
    mimeType,
    source,
    metadata: {
      ...metadata,
      version: (parseInt(metadata.version, 10) + 1).toString(),
      description: metadata.description,
    },
  };
};
