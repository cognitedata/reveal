/*!
 * Copyright 2021 Cognite AS
 */

import { LoadingState } from '@reveal/cad-geometry-loaders';

/**
 * Handler for events about data being loaded.
 */
export type LoadingStateChangeListener = (loadingState: LoadingState) => any;

export * from '../datamodels/pointcloud/types';
export * from './migration/types';
