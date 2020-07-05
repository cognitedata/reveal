/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from '../types';
import { CadSceneProvider } from '@/datamodels/cad/CadSceneProvider';
import { CadSectorProvider } from '@/datamodels/cad/sector/CadSectorProvider';
import { HttpHeadersProvider } from './HttpHeadersProvider';
import { EptSceneProvider } from '@/datamodels/pointcloud/EptSceneProvider';

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

export interface ModelUrlProvider<TModelIdentifier> {
  getModelUrl(identifier: TModelIdentifier): Promise<string>;
}

export interface Client<TModelIdentifier>
  extends ModelUrlProvider<TModelIdentifier>,
    CadSceneProvider,
    CadSectorProvider,
    HttpHeadersProvider,
    EptSceneProvider {}
