import { Colors } from '@cognite/cogs.js';

import { PredefinedStyle } from './types';

export const defaultColor = Colors['yellow-5'].alpha(0.5);

export const defaultColorTransparent = Colors['yellow-5'].alpha(0);

export const defaultShapeSettings = {
  circle: {
    strokeWidth: 10,
    stroke: defaultColor.string(),
    fill: defaultColorTransparent.string(),
  },
  line: { strokeWidth: 10, stroke: defaultColor.string() },
  rect: {
    strokeWidth: 10,
    stroke: defaultColor.string(),
    fill: defaultColorTransparent.string(),
  },
  text: { fill: defaultColor.alpha(1).string(), fontSize: 32 },
};

export const PRESET_COLORS = [
  defaultColor,
  Colors['midorange-5'],
  Colors['pink-5'],
  Colors['purple-5'],
  Colors.black,
  Colors['midblue-5'],
  Colors['lightblue-5'],
  Colors['green-5'],
  Colors.success,
  Colors['greyscale-grey6'],
  Colors['red-3'],
  Colors['green-3'],
  Colors['midblue-3'],
];

export const PREDEFINED_STYLES: PredefinedStyle[] = [
  { label: 'Custom', value: defaultColor },
  {
    label: 'Water',
    value: Colors['midblue-3'],
  },
  { label: 'Oil', value: Colors['green-3'] },
  { label: 'Gas', value: Colors['red-3'] },
];
