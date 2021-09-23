import { ExternalFileInfo, Metadata } from '@cognite/sdk';

import { ModelSource, UnitSystem } from './constants';

export interface ModelMetadata extends Metadata {
  dataType: string;
  description: string;
  fileName: string;
  nextVersion: string;
  previousVersion: string;
  unitSystem: keyof typeof UnitSystem;
  userEmail: string;
  version: string;
}

export interface FileInfo extends ExternalFileInfo {
  metadata: ModelMetadata;
  source: keyof typeof ModelSource;
}

export type UpdateFieldPayload<T> = { name: keyof T | string; value: string };
