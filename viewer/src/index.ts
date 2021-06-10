/*!
 * Copyright 2021 Cognite AS
 */

// entry point for everything that is available (@cognite/reveal)
// all types that we use in our public API must be reexported here
// if you see a type in api-reference docs, then it's properly exported

/**
 * @module @cognite/reveal
 */

export * from './public/migration/Cognite3DViewer';
export * from './revealEnv';
export { BoundingBoxClipper } from './utilities';
export { Cognite3DModel } from './public/migration/Cognite3DModel';
export { Cognite3DViewer } from './public/migration/Cognite3DViewer';
export { CognitePointCloudModel } from './public/migration/CognitePointCloudModel';

export * from './public/types';

export { NodeAppearance, NodeOutlineColor, DefaultNodeAppearance } from './datamodels/cad/NodeAppearance';

export {
  NodeSet,
  ByAssetNodeSet,
  ByTreeIndexNodeSet,
  ByNodePropertyNodeSet,
  CombinedNodeSet,
  InvertedNodeSet,
  NodeAppearanceProvider
} from './datamodels/cad/styling';
export { IndexSet } from './utilities/IndexSet';
export { NumericRange } from './utilities/NumericRange';

// Export ThreeJS to enable easy import for our users
import * as THREE from 'three';
export { THREE };
