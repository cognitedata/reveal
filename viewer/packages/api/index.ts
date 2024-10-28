/*!
 * Copyright 2022 Cognite AS
 */
export { Cognite3DViewer } from './src/public/migration/Cognite3DViewer';
export { CogniteCadModel } from '@reveal/cad-model';

export { ViewerState, ModelState, ClippingPlanesState } from './src/utilities/ViewStateHelper';

export * from './src/public/types';

const REVEAL_VERSION = process.env.VERSION;
export { REVEAL_VERSION };
