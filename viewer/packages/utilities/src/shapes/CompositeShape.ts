/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './ISerializableShape';
import { IShape } from './IShape';
import { SerializableCompositeShape } from './SerializableCompositeShape';

import { Box3 } from 'three';

export class CompositeShape implements IShape {
  private readonly _innerShapes: IShape[];

  constructor(innerShapes: IShape[]) {
    this._innerShapes = innerShapes;
  }

  get innerShapes(): IShape[] {
    return this._innerShapes;
  }

  getSerializableShape(): SerializableCompositeShape {
    return {
      shapeType: ShapeType.Composite,
      innerShapes: this._innerShapes.map(s => s.getSerializableShape())
    };
  }

  createBoundingBox(): Box3 {
    const unionedBox = new Box3();
    this._innerShapes
      .map(s => s.createBoundingBox())
      .forEach(b => unionedBox.union(b));

    return unionedBox;
  }
}
