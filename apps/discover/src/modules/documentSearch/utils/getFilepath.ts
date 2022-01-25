import { Document } from '@cognite/sdk-playground';

import { getMetadataItem } from './getMetadataItem';

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const getFilepath = (item: Document) => {
  if (!item) {
    // just incase API data is bad
    return '';
  }

  const absoluteFilepath =
    item.sourceFile.directory ||
    getMetadataItem(item, 'parentPath') ||
    getMetadataItem(item, 'path');

  // Find filename in path and remove it.
  const removeFileNameRegex = new RegExp(
    `${escapeRegExp(item.sourceFile.name)}$`
  );
  const parentFilepath = absoluteFilepath?.replace(removeFileNameRegex, '');

  return parentFilepath || '';
};
