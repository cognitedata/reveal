import Konva from 'konva';
import { CircleConfig } from 'konva/lib/shapes/Circle';

import { OrnateShapeConfig, Shape } from '..';

export type OrnateCircleConfig = OrnateShapeConfig & CircleConfig;

export class Circle extends Shape<OrnateCircleConfig> {
  constructor(config: OrnateCircleConfig) {
    super(config);
    this.shape = new Konva.Circle({
      ...config,
      type: 'CIRCLE',
    });
    this.init();
  }
}
