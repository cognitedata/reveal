/*!
 * Copyright 2022 Cognite AS
 */

import { EDLOptions } from '../rendering/types';

export function shouldApplyEdl(edlOptions: EDLOptions): boolean {
  return edlOptions.radius !== 0 && edlOptions.strength !== 0;
}
