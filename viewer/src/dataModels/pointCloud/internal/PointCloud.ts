/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from '../../../utilities/File3dFormat';
import { PromiseCallbacks } from '../../../utilities/PromiseCallbacks';
import { CdfSource } from '../../../utilities/networking/CdfSource';
import { ExternalSource } from '../../../utilities/networking/ExternalSource';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';

export interface PointCloud {
  format: File3dFormat.EptPointCloud;
  source: CdfSource | ExternalSource;
  callbacks: PromiseCallbacks<[PotreeGroupWrapper, PotreeNodeWrapper]>;
}
