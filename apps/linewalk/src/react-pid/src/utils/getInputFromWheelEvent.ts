import debounce from 'lodash/debounce';

import InputDevice from './InputDevice';

const EVENT_SAMPLING_TIME_MS = 500;
const CHROME_DELTA_Y_MULTIPLIER = 120;

const getInputDeviceFromWheelEvent = (event: WheelEvent): InputDevice => {
  const isVerticalScroll = event.deltaY !== 0;
  const isVerticalScrollMultipleOfCommonMultiplier =
    Math.abs(event.deltaY) % CHROME_DELTA_Y_MULTIPLIER === 0;

  if (isVerticalScroll && isVerticalScrollMultipleOfCommonMultiplier) {
    return InputDevice.MOUSE;
  }

  return InputDevice.TOUCHPAD;
};

/**
 * This is debounced because we only want to sample the first event
 * of a continuous scrolling period, since a longer period of scrolling
 * could accidentally touch "magic" values and switch the detected input device
 */

const debouncedGetInputDeviceFromWheelEvent = debounce(
  getInputDeviceFromWheelEvent,
  EVENT_SAMPLING_TIME_MS,
  {
    leading: true,
    trailing: false,
  }
);

// This makes sure the return type for the debounced function omits undefined
export default (event: WheelEvent) =>
  debouncedGetInputDeviceFromWheelEvent(event) ?? InputDevice.MOUSE;
