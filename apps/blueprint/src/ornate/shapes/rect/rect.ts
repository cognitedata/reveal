import Konva from 'konva';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { v4 as uuid } from 'uuid';

import { OrnateShapeConfig, Shape } from '..';

export type OrnateRectConfig = OrnateShapeConfig & RectConfig;

export class Rect extends Shape<OrnateRectConfig> {
  constructor(config: OrnateRectConfig) {
    super(config);
    this.shape = new Konva.Rect({
      ...config,
      id: config.id || uuid(),
      type: 'RECT',
    });
    this.init();
  }
}
