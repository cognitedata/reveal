/*!
 * Copyright 2020 Cognite AS
 */

export { CogniteModelBase } from './public/migration/CogniteModelBase';
export { Cognite3DModel } from './public/migration/Cognite3DModel';
export { CognitePointCloudModel } from './public/migration/CognitePointCloudModel';
export { Cognite3DViewer } from './public/migration/Cognite3DViewer';
export { Intersection } from './public/migration/types';
export * from './public/migration/Cognite3DViewer';
export * from './public/migration/types';
export { SupportedModelTypes } from './datamodels/base/SupportedModelTypes';
export { CadLoadingHints } from './datamodels/cad/CadLoadingHints';
export { BoundingBoxClipper } from './utilities';
export * from './revealEnv';
export * from './datamodels/pointcloud/types';

// Export ThreeJS to enable easy import for our users
import * as THREE from 'three';
export { THREE };
