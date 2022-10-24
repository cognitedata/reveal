/*!
 * Copyright 2022 Cognite AS
 */

import { ISerializableShape } from './ISerializableShape';

export type SerializableCompositeShape = ISerializableShape & {
  readonly innerShapes: ISerializableShape[];
};
