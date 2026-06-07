/*!
 * Copyright 2022 Cognite AS
 */
import pkg from '../../package.json' with { type: 'json' };

export { Cognite3DViewer } from './src/public/migration/Cognite3DViewer';
export { CogniteCadModel } from '@reveal/cad-model';

export type { ViewerState, ModelState, ClippingPlanesState } from './src/utilities/ViewStateHelper';

export * from './src/public/types';

const REVEAL_VERSION = pkg.version;
export { REVEAL_VERSION };
