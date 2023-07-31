import Konva from 'konva';
import { TextConfig } from 'konva/lib/shapes/Text';
import { v4 as uuid } from 'uuid';

import { OrnateShapeConfig, Shape } from '..';

export type OrnateTextConfig = OrnateShapeConfig & TextConfig;

export class Text extends Shape<OrnateTextConfig> {
  shape: Konva.Text;
  constructor(config: OrnateTextConfig) {
    super(config);
    this.shape = new Konva.Text({
      ...config,
      id: config.id || uuid(),
      type: 'TEXT',
    });
    this.init();
  }
}
