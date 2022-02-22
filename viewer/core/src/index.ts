/*!
 * Copyright 2021 Cognite AS
 */

// entry point for everything that is available (@cognite/reveal)
// all types that we use in our public API must be reexported here
// if you see a type in api-reference docs, then it's properly exported

/**
 * @module @cognite/reveal
 */

export { NodeAppearanceProvider, NodeAppearance, NodeOutlineColor, DefaultNodeAppearance } from '@reveal/cad-styling';

export {
  NodeCollection,
  TreeIndexNodeCollection,
  IntersectionNodeCollection,
  UnionNodeCollection,
  SerializedNodeCollection,
  PropertyFilterNodeCollection,
  SinglePropertyFilterNodeCollection,
  AssetNodeCollection,
  InvertedNodeCollection,
  registerCustomNodeCollectionType,
  TypeName,
  NodeCollectionDescriptor,
  NodeCollectionSerializationContext
} from '@reveal/cad-styling';

export { revealEnv, IndexSet, NumericRange } from '@reveal/utilities';

export * from './public/migration/Cognite3DViewer';
export { BoundingBoxClipper } from './utilities';
export { Cognite3DModel } from './public/migration/Cognite3DModel';
export { Cognite3DViewer } from './public/migration/Cognite3DViewer';
export { CognitePointCloudModel } from './public/migration/CognitePointCloudModel';

export { ViewerState, ModelState } from './utilities/ViewStateHelper';

export * from './public/types';

// Export ThreeJS to enable easy import for our users
import * as THREE from 'three';
export { THREE };

const REVEAL_VERSION = process.env.VERSION;
export { REVEAL_VERSION };
