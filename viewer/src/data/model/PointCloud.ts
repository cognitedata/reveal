/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from './File3dFormat';
import { PromiseCallbacks } from './PromiseCallbacks';
import { CdfSource } from './CdfSource';
import { ExternalSource } from './ExternalSource';
import { PotreeGroupWrapper } from '../../views/threejs/pointcloud/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '../../views/threejs/pointcloud/PotreeNodeWrapper';

export interface PointCloud {
  format: File3dFormat.EptPointCloud;
  source: CdfSource | ExternalSource;
  callbacks: PromiseCallbacks<[PotreeGroupWrapper, PotreeNodeWrapper]>;
}
