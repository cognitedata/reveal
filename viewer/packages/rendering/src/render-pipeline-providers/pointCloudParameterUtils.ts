/*!
 * Copyright 2022 Cognite AS
 */

import { EdlOptions } from '../rendering/types';

export function shouldApplyEdl(edlOptions: EdlOptions): boolean {
  return edlOptions.radius !== 0 && edlOptions.strength !== 0;
}
