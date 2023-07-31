import forEach from 'lodash/forEach';
import get from 'lodash/get';

import { Metadata } from '../../../../../domain/projectConfig/types';

import { adaptSelectedPathToMetadataPath } from './adaptSelectedPathToMetadataPath';

export const getArrayChangeDetail = (
  selectedPath = '',
  metadata: Metadata = {}
): { hasArrayChange: boolean; arrayChangePath: string } => {
  if (selectedPath) {
    const extractedPath = selectedPath.split('.');
    let hasArrayChange = false;
    let arrayChangePath = '';

    forEach(extractedPath, (path, index) => {
      const currentPath = index === 0 ? path : `${arrayChangePath}.${path}`;
      const currentMetadata = get(
        metadata,
        adaptSelectedPathToMetadataPath(currentPath)
      );

      if (!hasArrayChange) {
        arrayChangePath = currentPath;
      }

      if (currentMetadata.type === 'array') {
        hasArrayChange = true;
      }
    });

    return { hasArrayChange, arrayChangePath };
  }

  return { hasArrayChange: false, arrayChangePath: '' };
};
