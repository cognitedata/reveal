import debounce from 'lodash/debounce';

import InputDevice from './InputDevice';

const EVENT_SAMPLING_TIME_MS = 100;
const CHROME_WHEEL_DELTA_Y_MULTIPLIER = 120;

const getInputDeviceFromWheelEvent = (
  event: WheelEvent & { wheelDeltaY?: number }
): InputDevice => {
  if (event?.wheelDeltaY === undefined) {
    return InputDevice.TOUCHPAD;
  }

  const isVerticalScroll = event.wheelDeltaY !== 0;
  const isVerticalScrollMultipleOfCommonMultiplier =
    Math.abs(event.wheelDeltaY) % CHROME_WHEEL_DELTA_Y_MULTIPLIER === 0;

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
export default debounce(getInputDeviceFromWheelEvent, EVENT_SAMPLING_TIME_MS, {
  leading: true,
  trailing: false,
});
