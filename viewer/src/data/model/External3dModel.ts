/*!
 * Copyright 2020 Cognite AS
 */

import { PromiseCallbacks } from './PromiseCallbacks';
import { CadNode } from '../../views/threejs/cad/CadNode';

export interface External3dModel {
  discriminator: 'external';
  url: string;
  callbacks: PromiseCallbacks<CadNode>;
}
