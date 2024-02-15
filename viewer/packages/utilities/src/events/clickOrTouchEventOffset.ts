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
export function clickOrTouchEventOffset(
  event: PointerEvent | WheelEvent,
  target: HTMLElement
): { offsetX: number; offsetY: number } {
  const rect = target.getBoundingClientRect();

  if (event instanceof PointerEvent) {
    if (event.pointerType === 'mouse' || event.pointerType === 'touch') {
      return {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      };
    }
  } else if (event instanceof WheelEvent) {
    return {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
  }

  // Invalid event
  return {
    offsetX: -1,
    offsetY: -1
  };
}

/**
 * Determines clicked or touched coordinate as offset
 * @param event     An PointerEvent or WheelEvent.
 * @param target    HTML element to find coordinates relative to.
 * @returns A Vector2 containing coordinates relative to the HTML element provided.
 */
export function getClickOrTouchEventPoint(event: PointerEvent | WheelEvent, target: HTMLElement): Vector2 {
  const point = clickOrTouchEventOffset(event, target);
  return new Vector2(point.offsetX, point.offsetY);
}
