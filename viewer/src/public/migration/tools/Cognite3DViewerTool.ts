/*!
 * Copyright 2021 Cognite AS
 */

import { DisposedDelegate } from './types';

/**
 * Interface for tools that attach to `Cognite3DViewer`.
 * @internal
 */
export interface Cognite3DViewerTool {
  dispose(): void;
  on(event: 'disposed', handler: DisposedDelegate): void;
  off(event: 'disposed', handler: DisposedDelegate): void;

  notifyRendered(): void;
}
