/*!
 * Copyright 2026 Cognite AS
 */
import { CadSceneRootMetadata } from './parsers/types';
import { CadMetadataWithSignedFiles } from './types';

export function isCadMetadataWithSignedFiles(data: unknown): data is CadMetadataWithSignedFiles {
  return (
    data !== null &&
    typeof data === 'object' &&
    'type' in data &&
    data.type === 'cadMetadata' &&
    'signedFiles' in data &&
    data.signedFiles !== null &&
    typeof data.signedFiles === 'object' &&
    'items' in data.signedFiles &&
    Array.isArray(data.signedFiles.items) &&
    hasFileData<CadSceneRootMetadata>(data)
  );
}

export function hasFileData<T extends CadSceneRootMetadata>(data: unknown): data is T {
  return (
    data !== null &&
    typeof data === 'object' &&
    'fileData' in data &&
    data.fileData !== null &&
    typeof data.fileData === 'object'
  );
}
