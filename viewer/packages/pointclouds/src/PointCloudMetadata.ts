/*!
 * Copyright 2021 Cognite AS
 */

import type { Matrix4 } from 'three';
import type { CameraConfiguration } from '@reveal/utilities';
import type { File3dFormat, ModelIdentifier } from '@reveal/data-providers';
import type { SignedFileItem } from '@reveal/data-providers';

export interface PointCloudMetadata {
  readonly format: File3dFormat;
  readonly formatVersion: number;

  readonly modelBaseUrl: string;
  readonly signedFilesBaseUrl: string;
  readonly modelIdentifier: ModelIdentifier;
  readonly modelMatrix: Matrix4;
  readonly cameraConfiguration?: CameraConfiguration;
  readonly scene: any;
  readonly signedFiles?: { items: SignedFileItem[] };
}
