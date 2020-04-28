/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from './File3dFormat';
import { ModelNodeAppearance } from '../../views/common/cad/ModelNodeAppearance';
import { CadNode } from '../../views/threejs/cad/CadNode';
import { PromiseCallbacks } from './PromiseCallbacks';
import { CdfSource } from './CdfSource';
import { ExternalSource } from './ExternalSource';

export interface Cad {
  source: CdfSource | ExternalSource;
  format: File3dFormat.RevealCadModel;
  modelNodeAppearance?: ModelNodeAppearance;
  callbacks: PromiseCallbacks<CadNode>;
}
