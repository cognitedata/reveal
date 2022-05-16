import Konva from 'konva';
import { LineConfig } from 'konva/lib/shapes/Line';
import { v4 as uuid } from 'uuid';

import { OrnateShapeConfig, Shape } from '..';

export type OrnateLineConfig = OrnateShapeConfig & LineConfig;

export class Line extends Shape<OrnateLineConfig> {
  shape: Konva.Line;
  constructor(config: OrnateLineConfig) {
    super(config);
    this.shape = new Konva.Line({
      ...config,
      id: config.id || uuid(),
      type: 'LINE',
    });
    this.init();
  }
}
