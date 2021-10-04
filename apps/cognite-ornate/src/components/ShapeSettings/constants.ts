import { Colors } from '@cognite/cogs.js';

export const PRESET_COLORS = [
  Colors['yellow-5'].hex(),
  Colors['midorange-5'].hex(),
  Colors['pink-5'].hex(),
  Colors['purple-5'].hex(),
  Colors.black.hex(),
  Colors['midblue-5'].hex(),
  Colors['lightblue-5'].hex(),
  Colors['green-5'].hex(),
  Colors.success.hex(),
  Colors['greyscale-grey6'].hex(),
];

export const defaultShapeSettings = {
  strokeWidth: 10,
  strokeColor: Colors['yellow-5'].hex(),
  opacity: 1,
  fontSize: 32,
};
