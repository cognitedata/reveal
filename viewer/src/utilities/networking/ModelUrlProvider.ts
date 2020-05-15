/*!
 * Copyright 2020 Cognite AS
 */

import { IdEither } from '@cognite/sdk';
import { File3dFormat } from '../File3dFormat';

export interface ModelUrlProvider {
  getModelUrl(modelRevisionId: IdEither, format: File3dFormat): Promise<string>;
}
