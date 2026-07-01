/*!
 * Copyright 2021 Cognite AS
 */

import type { Matrix4 } from 'three';
import type { CameraConfiguration } from '@reveal/utilities';
import type { File3dFormat, ModelIdentifier } from '@reveal/data-providers';
import type { DMSJsonFileItem } from '@reveal/data-providers/src/types';

export interface PointCloudMetadata {
  readonly format: File3dFormat;
  readonly formatVersion: number;

  readonly modelBaseUrl: string;
  readonly signedFilesBaseUrl?: string;
  readonly modelIdentifier: ModelIdentifier;
  readonly modelMatrix: Matrix4;
  readonly cameraConfiguration?: CameraConfiguration;
  readonly scene: any;
  readonly signedFiles?: { items: DMSJsonFileItem[] };
}
