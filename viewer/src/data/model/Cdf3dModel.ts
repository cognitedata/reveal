/*!
 * Copyright 2020 Cognite AS
 */

import { IdEither } from '@cognite/sdk';
import { File3dFormat } from './File3dFormat';

export interface Cdf3dModel {
  discriminator: 'cdf-model';
  modelRevision: IdEither;
  format: File3dFormat;
}
