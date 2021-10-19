import { OptionType } from '@cognite/cogs.js';
import { ExternalFileInfo, Metadata } from '@cognite/sdk';

import { BoundaryCondition, ModelSource, UnitSystem } from './constants';

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

export interface CreatedAndUpdatedTime {
  createdTime: Date;
  updatedTime: Date;
}

export interface FileInfo extends ExternalFileInfo {
  metadata: ModelMetadata;
  source: keyof typeof ModelSource;
}

export interface ModelFormData {
  file?: File;
  boundaryConditions: (OptionType<BoundaryCondition> & {
    value: BoundaryCondition;
  })[];
  fileInfo: FileInfo;
}
