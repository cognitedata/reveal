import get from 'lodash/get';
import { Document } from '@cognite/sdk';

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const getFilepath = (item: Document) => {
  if (!item) {
    // just incase API data is bad
    return '';
  }

  const absoluteFilepath =
    item.sourceFile?.directory ||
    get(item.sourceFile, 'metadata.parentPath') ||
    get(item.sourceFile, 'metadata.path');

  // Find filename in path and remove it.
  const removeFileNameRegex = new RegExp(
    `${escapeRegExp(item.sourceFile.name)}$`
  );
  const parentFilepath = absoluteFilepath?.replace(removeFileNameRegex, '');

  return parentFilepath || '';
};
