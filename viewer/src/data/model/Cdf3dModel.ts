/*!
 * Copyright 2020 Cognite AS
 */

import { IdEither } from '@cognite/sdk';
import { File3dFormat } from './File3dFormat';
import { PromiseCallbacks } from './PromiseCallbacks';
import { CadNode } from '../../views/threejs';

export interface Cdf3dModel {
  discriminator: 'cdf-model';
  modelRevision: IdEither;
  format: File3dFormat;
  callbacks: PromiseCallbacks<CadNode>;
}
