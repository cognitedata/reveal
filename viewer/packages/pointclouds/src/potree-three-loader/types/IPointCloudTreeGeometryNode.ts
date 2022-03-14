/*!
 * Copyright 2022 Cognite AS
 */

import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import * as THREE from 'three';

export interface IPointCloudTreeGeometryNode extends IPointCloudTreeNodeBase {
  geometry: THREE.BufferGeometry | undefined;
  failed: boolean;
  load: () => Promise<void>;
  oneTimeDisposeHandlers: (() => void)[];
};
