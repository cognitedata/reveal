/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from '../../../utilities/File3dFormat';
import { ModelNodeAppearance } from './ModelNodeAppearance';
import { CadNode } from './CadNode';
import { PromiseCallbacks } from '../../../utilities/PromiseCallbacks';
import { CdfSource } from '../../../utilities/networking/CdfSource';
import { ExternalSource } from '../../../utilities/networking/ExternalSource';

export interface Cad {
  source: CdfSource | ExternalSource;
  format: File3dFormat.RevealCadModel;
  modelNodeAppearance?: ModelNodeAppearance;
  callbacks: PromiseCallbacks<CadNode>;
}
