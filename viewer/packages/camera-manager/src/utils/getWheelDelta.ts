/*!
 * Copyright 2024 Cognite AS
 */

const IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;

export function getWheelDelta(event: WheelEvent): number {
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
    const factor = IS_FIREFOX ? 1 : 40;
    return event.deltaY / factor;
  }
  return 0;
}
