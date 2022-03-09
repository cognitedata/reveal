import { Colors } from '@cognite/cogs.js';
import Color from 'color';

export const PRESET_COLORS = [
  new Color('#6E85FC'),
  new Color('#D46AE2'),
  new Color('#FD5190'),
  new Color('#FF8746'),
  new Color('#1AA3C1'),
  new Color('#EB9B00'),
  new Color('#C13670'),
  new Color('#078D79'),
];

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
