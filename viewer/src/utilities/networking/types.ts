/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat, ModelTransformation } from '../types';
import { HttpHeadersProvider } from './HttpHeadersProvider';

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

export interface ModelUrlProvider<TModelIdentifier> {
  getModelUrl(identifier: TModelIdentifier): Promise<string>;
}

export interface ModelTransformationProvider {
  getModelTransformation(): ModelTransformation;
}

// TODO 2020-07-07 larsmoa: CadSceneProvider,CadSectorProvider, EptSceneProvider needs to be moved,
// and merged to a single thing. It's all just about receiving files.
export interface CadSceneProvider {
  getCadScene(blobUrl: string): Promise<any>;
}

export interface CadSectorProvider {
  getCadSectorFile(blobUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface EptSceneProvider {
  getEptScene(blobUrl: string): Promise<any>;
}

export interface ModelDataClient<TModelIdentifier>
  extends ModelUrlProvider<TModelIdentifier>,
    CadSceneProvider,
    CadSectorProvider,
    EptSceneProvider,
    HttpHeadersProvider {}
