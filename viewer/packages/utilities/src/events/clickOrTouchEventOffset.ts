/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Determines clicked or touched coordinate as offset
 * @param ev        An PointerEvent or WheelEvent.
 * @param target    HTML element to find coordinates relative to.
 * @returns A struct containing coordinates relative to the HTML element provided.
 */
export function clickOrTouchEventOffset(
  ev: PointerEvent | WheelEvent,
  target: HTMLElement
): { offsetX: number; offsetY: number } {
  const rect = target.getBoundingClientRect();

  if (ev instanceof PointerEvent) {
    if (ev.pointerType === 'mouse' || ev.pointerType === 'touch') {
      return {
        offsetX: ev.clientX - rect.left,
        offsetY: ev.clientY - rect.top
      };
    }
  } else if (ev instanceof WheelEvent) {
    return {
      offsetX: ev.clientX - rect.left,
      offsetY: ev.clientY - rect.top
    };
  }

  // Invalid event
  return {
    offsetX: -1,
    offsetY: -1
  };
}
