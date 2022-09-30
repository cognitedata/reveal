import {
  Cognite3DModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
} from '@cognite/reveal-4.x';

/**
 * Resets all event handlers on the viewer provided. This uses
 * internal functionality and actual applications needs to implement
 * this to better approaches than this.
 */
export function resetViewerEventHandlers(viewer: Cognite3DViewer): void {
  const eventListeners = (viewer as any)._events;
  eventListeners.cameraChange.unsubscribeAll();
  eventListeners.click.unsubscribeAll();
  eventListeners.hover.unsubscribeAll();
}

/**
 * Resets state of model to the default state (i.e. appearance and styled sets)
 * @param model
 */
export function resetCognite3DModel(model: Cognite3DModel): void {
  model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
  model.removeAllStyledNodeCollections();
}
