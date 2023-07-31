import Konva from 'konva';
import { ImageConfig } from 'konva/lib/shapes/Image';

import { OrnateShapeConfig, Shape } from '..';

export type OrnateImageConfig = OrnateShapeConfig &
  Omit<ImageConfig, 'image'> & {
    imageURL: string;
  };

export class Image extends Shape<OrnateImageConfig> {
  constructor(config: OrnateImageConfig) {
    super(config);
    this.shape = new Konva.Image({
      ...config,
      image: undefined,
      type: 'IMAGE',
    });

    Konva.Image.fromURL(config.imageURL, (node: Konva.Shape) => {
      this.shape.setAttrs({
        ...node.attrs,
        ...config,
      });
    });

    this.init();
  }
}
