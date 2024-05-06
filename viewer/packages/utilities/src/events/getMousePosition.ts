/*!
 * Copyright 2021 Cognite AS
 */

import { Vector2 } from 'three';

/**
 * Determines clicked or touched coordinate as offset
 * @param event     An PointerEvent or WheelEvent.
 * @param target    HTML element to find coordinates relative to.
 * @returns A struct containing coordinates relative to the HTML element provided.
 */
export function getMousePosition(event: PointerEvent | WheelEvent, target: HTMLElement): { x: number; y: number } {
  const rect = target.getBoundingClientRect();

  if (event instanceof PointerEvent) {
    if (event.pointerType === 'mouse' || event.pointerType === 'touch') {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  } else if (event instanceof WheelEvent) {
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // Invalid event
  return {
    x: -1,
    y: -1
  };
}

/**
 * Determines clicked or touched coordinate as offset
 * @param event     An PointerEvent or WheelEvent.
 * @param target    HTML element to find coordinates relative to.
 * @returns A Vector2 containing coordinates relative to the HTML element provided.
 */
export function getMousePositionCoords(event: PointerEvent | WheelEvent, target: HTMLElement): Vector2 {
  const point = getMousePosition(event, target);
  return new Vector2(point.x, point.y);
}
