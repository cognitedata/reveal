import debounce from 'lodash/debounce';

const EVENT_SAMPLING_TIME_MS = 100;
const CHROME_WHEEL_DELTA_Y_MULTIPLIER = 120;

export enum WheelEventInputType {
  TOUCHPAD_PAN = 'touchpadPan',
  TOUCHPAD_PINCH_TO_ZOOM = 'touchpadPinchToZoom',
  MOUSE_WHEEL = 'mouseWheel',
}

export const getInputTypeFromWheelEvent = (
  event: WheelEvent & { wheelDeltaY?: number }
): WheelEventInputType => {
  if (event?.wheelDeltaY === undefined) {
    return WheelEventInputType.TOUCHPAD_PAN;
  }

  const isVerticalScroll = event.wheelDeltaY !== 0;
  const isVerticalScrollMultipleOfCommonMultiplier =
    Math.abs(event.wheelDeltaY) % CHROME_WHEEL_DELTA_Y_MULTIPLIER === 0;

  if (isVerticalScroll && isVerticalScrollMultipleOfCommonMultiplier) {
    if (Math.abs(event.deltaY) < 60)
      return WheelEventInputType.TOUCHPAD_PINCH_TO_ZOOM;
    return WheelEventInputType.MOUSE_WHEEL;
  }

  return WheelEventInputType.TOUCHPAD_PAN;
};

/**
 * This is debounced because we only want to sample the first event
 * of a continuous scrolling period, since a longer period of scrolling
 * could accidentally touch "magic" values and switch the detected input device
 */
export default debounce(getInputTypeFromWheelEvent, EVENT_SAMPLING_TIME_MS, {
  leading: true,
  trailing: false,
});
