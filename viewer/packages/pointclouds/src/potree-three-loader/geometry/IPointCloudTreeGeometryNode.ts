import type { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';
import type * as THREE from 'three';

export interface IPointCloudTreeGeometryNode extends IPointCloudTreeNodeBase {
  geometry: THREE.BufferGeometry | undefined;
  failed: boolean;
  load: () => Promise<void>;
  baseUrl: () => string;
  fileName: () => string;
  oneTimeDisposeHandlers: (() => void)[];

  doneLoading: (
    bufferGeometry: THREE.BufferGeometry,
    _tightBoundingBox: THREE.Box3,
    np: number,
    _mean: THREE.Vector3
  ) => void;
}
