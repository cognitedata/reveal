/*!
 * Copyright 2021 Cognite AS
 */

export type DisposedDelegate = () => void;

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
