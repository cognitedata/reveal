/*!
 * Copyright 2020 Cognite AS
 */

export { CogniteModelBase } from './public/migration/CogniteModelBase';
export { Cognite3DModel } from './public/migration/Cognite3DModel';
export { CognitePointCloudModel } from './public/migration/CognitePointCloudModel';
export * from './public/migration/Cognite3DViewer';
export { Intersection } from './public/migration/types';
export { Color, Cognite3DViewerOptions, AddModelOptions } from './public/migration/types';
export { CadLoadingHints } from './datamodels/cad/CadLoadingHints';
export { BoundingBoxClipper } from './utilities';

export { PotreePointColorType } from './datamodels/pointcloud/types';

// Export ThreeJS to enable easy import for our users
import * as THREE from 'three';
export { THREE };
export { SupportedModelTypes } from '@/datamodels/base/SupportedModelTypes';
export * from './revealEnv';
