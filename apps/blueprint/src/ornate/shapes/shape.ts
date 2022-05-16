import Konva from 'konva';
import { v4 as uuid } from 'uuid';

import { OrnateShapeConfig } from './types';

export class Shape<T extends OrnateShapeConfig> {
  public shape: Konva.Shape | Konva.Group;
  public config: T;
  constructor(config: T) {
    this.shape = new Konva.Shape();
    this.config = config;
    this.init();
  }

  public init = () => {
    if (this.config.onClick) {
      this.shape.on('click', this.config.onClick);
    }
    this.shape.id(this.config.id || uuid());
  };
}
