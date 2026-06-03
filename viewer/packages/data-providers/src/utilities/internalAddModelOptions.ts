/*!
 * Copyright 2024 Cognite AS
 */
import type { GeometryFilter } from '@reveal/cad-model';
import type { ClassicModelIdentifierType, InternalDataSourceType, LocalModelIdentifierType } from '../DataSourceType';
import type { File3dFormat } from '../types';

/**
 * Model options common to all model types.
 */
export type CommonModelOptions = {
  /**
   * An optional local file which will be used to load the data.
   */
  localPath?: string;
  /**
   * An optional geometryFilter which will be applied to loading model.
   */
  geometryFilter?: GeometryFilter;
  /**
   * Override which output format to load for this model revision.
   * Defaults to 'gltf-directory'. Set to 'gltf-prioritized-nodes-directory'
   * to load high-detail geometry from a PrioritizedNodes job output.
   */
  outputFormat?: File3dFormat;
};

export type LocalAddModelOptions = CommonModelOptions & LocalModelIdentifierType;

export type InternalAddModelOptions<T extends InternalDataSourceType> = CommonModelOptions & T['modelIdentifier'];

export type AddModelOptionsWithModelRevisionId<T extends InternalDataSourceType> = InternalAddModelOptions<T> & {
  classicModelRevisionId: ClassicModelIdentifierType;
};
