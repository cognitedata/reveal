import {
  Cognite3DViewer,
} from '@cognite/reveal-1.x';

/**
 * Resets all event handlers on the viewer provided. This uses
 * internal functionality and actual applications needs to implement
 * this to better approaches than this.
 */
export function resetViewerEventHandlers(viewer: Cognite3DViewer): void {
  // @ts-expect-error
  const eventListeners = viewer._events;
  eventListeners.cameraChange.unsubscribeAll();
  eventListeners.click.unsubscribeAll();
  eventListeners.hover.unsubscribeAll();
}
