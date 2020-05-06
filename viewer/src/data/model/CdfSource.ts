/*!
 * Copyright 2020 Cognite AS
 */

import { IdEither } from '@cognite/sdk';

export interface CdfSource {
  discriminator: 'cdf';
  modelRevision: IdEither;
}
