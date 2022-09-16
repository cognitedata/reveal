/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './IShape';

export type CompositeShape = IShape & {
  readonly innerShapes: IShape[];
};
