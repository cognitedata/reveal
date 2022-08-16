import { Vector4 } from 'three';
import { IClassification } from './types';

export const DEFAULT_CLASSIFICATION: IClassification = {
  0: new Vector4(1.0, 0.0, 0.0, 1.0),
  1: new Vector4(0.8980392, 0.8980392, 0.44705883, 1.0),
  2: new Vector4(0.22745098, 0.8, 0.0, 1.0),
  3: new Vector4(0.49803922, 1.0, 0.78431374, 1.0),
  4: new Vector4(1.0, 0.5137255, 0.8980392, 1.0),
  5: new Vector4(0.5137255, 0.4, 0.8, 1.0),
  6: new Vector4(1.0, 1.0, 0.0, 1.0),
  7: new Vector4(1.0, 1.0, 0.0, 1.0),
  8: new Vector4(1.0, 1.0, 0.0, 1.0),
  9: new Vector4(1.0, 1.0, 0.0, 1.0),
  12: new Vector4(1.0, 1.0, 0.0, 1.0),
  DEFAULT: new Vector4(0.3, 0.6, 0.6, 1.0)
};