/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Determines clicked or touched coordinate as offset
 * @param ev        An MouseEvent or TouchEvent.
 * @param target    HTML element to find coordinates relative to.
 * @returns A struct containing coordinates relative to the HTML element provided.
 *
 * @internal
 */
export function clickOrTouchEventOffset(ev: MouseEvent | TouchEvent, target: HTMLElement) {
  const rect = target.getBoundingClientRect();

  if (ev instanceof MouseEvent) {
    return {
      offsetX: ev.clientX - rect.left,
      offsetY: ev.clientY - rect.top
    };
  } else if (ev.changedTouches.length > 0) {
    const touch = ev.changedTouches[0];
    return {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top
    };
  }

  // Invalid event
  return {
    offsetX: -1,
    offsetY: -1
  };
}
