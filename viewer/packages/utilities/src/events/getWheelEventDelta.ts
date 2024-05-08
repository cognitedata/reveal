/*!
 * Copyright 2024 Cognite AS
 */

/**
 * Determines hove many deltas the whell has been scrolled.
 * @param event     An WheelEvent
 */
export function getWheelEventDelta(event: WheelEvent): number {
  // @ts-ignore event.wheelDelta is only part of WebKit / Opera / Explorer 9
  if (event.wheelDelta) {
    // @ts-ignore event.wheelDelta is only part of WebKit / Opera / Explorer 9

    // Normally the delta is 120, but it can be more on mac when use the scroll wheel a lot
    const wheelDelta = Math.sign(event.wheelDelta) * Math.min(Math.abs(event.wheelDelta), 120);
    return -wheelDelta / 40;
  }
  if (event.detail) {
    // Firefox
    return event.detail;
  }
  if (event.deltaY) {
    // Firefox / Explorer + event target is SVG.
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;

    const factor = isFirefox ? 1 : 40;
    return event.deltaY / factor;
  }
  return 0;
}
