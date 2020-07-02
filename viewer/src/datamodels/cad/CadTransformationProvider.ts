/*!
 * Copyright 2020 Cognite AS
 */

import { ModelTransformation } from '@/utilities';

export interface CadTransformationProvider {
  getCadTransformation(): ModelTransformation;
}
