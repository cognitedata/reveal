import { ResourceType } from 'modules/sdk-builder/types';
import {
  count as countFiles,
  retrieveItemsById as retrieveFiles,
} from '../files';
import {
  count as countAssets,
  retrieveItemsById as retrieveAssets,
} from '../assets';

export function getCountAction(resourceType: ResourceType) {
  switch (resourceType) {
    case 'files':
      return countFiles;
    case 'assets':
      return countAssets;
    default:
      throw new Error(`Resource type '${resourceType}' not supported`);
  }
}

export function getRetrieveAction(resourceType: ResourceType) {
  switch (resourceType) {
    case 'files':
      return retrieveFiles;
    case 'assets':
      return retrieveAssets;
    default:
      throw new Error(`Resource type '${resourceType}' not supported`);
  }
}
