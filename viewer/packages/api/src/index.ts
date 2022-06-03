/*!
 * Copyright 2021 Cognite AS
 */

// entry point for everything that is available (@cognite/reveal)
// all types that we use in our public API must be reexported here
// if you see a type in api-reference docs, then it's properly exported

/**
 * @module @cognite/reveal
 */

export { Cognite3DViewer } from './public/migration/Cognite3DViewer';

export { ViewerState, ModelState } from './utilities/ViewStateHelper';

export * from './public/types';

// Export ThreeJS to enable easy import for our users
import * as THREE from 'three';
export { THREE };

const REVEAL_VERSION = process.env.VERSION;
export { REVEAL_VERSION };
