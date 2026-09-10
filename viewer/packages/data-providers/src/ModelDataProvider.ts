/*!
 * Copyright 2022 Cognite AS
 */

import type { BinaryFileProvider, JsonFileProvider, SignedFileProvider } from './types';

/**
 * Provides data for 3D models.
 */
export interface ModelDataProvider extends JsonFileProvider, BinaryFileProvider, SignedFileProvider {}
