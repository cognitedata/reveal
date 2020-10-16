import {
  CameraChangeDelegate,
  PointerEventDelegate,
  Cognite3DViewer,
} from '@cognite/reveal';

type InternalEventListeners = {
  cameraChange: CameraChangeDelegate[];
  click: PointerEventDelegate[];
  hover: PointerEventDelegate[];
};

/**
 * Resets all event handlers on the viewer provided. This uses
 * internal functionality and actual applications needs to implement
 * this to better approaches than this.
 */
export function resetViewerEventHandlers(viewer: Cognite3DViewer): void {
  // @ts-expect-error
  const eventListeners: InternalEventListeners = viewer.eventListeners;
  eventListeners.cameraChange.forEach((l) => viewer.off('cameraChange', l));
  eventListeners.click.forEach((l) => viewer.off('click', l));
  eventListeners.hover.forEach((l) => viewer.off('hover', l));
}
