/*!
 * Copyright 2021 Cognite AS
 */

import { Vector2 } from 'three';

/**
 * Determines clicked or touched coordinate as offset
 * @param event     An PointerEvent or WheelEvent.
 * @param domElement    HTML element to find coordinates relative to.
 * @returns A Vector2 containing coordinates relative to the HTML element provided.
 */
export function getPixelCoordinatesFromEvent(event: PointerEvent | WheelEvent | MouseEvent, domElement: HTMLElement): Vector2 {
  const rect = domElement.getBoundingClientRect();
  if (event instanceof PointerEvent) {
    if (event.pointerType === 'mouse' || event.pointerType === 'touch') {
      return new Vector2(event.clientX - rect.left, event.clientY - rect.top);
    }
  } else if (event instanceof WheelEvent) {
    return new Vector2(event.clientX - rect.left, event.clientY - rect.top);
  }
  // Invalid event
  return new Vector2(-1, -1);
}
