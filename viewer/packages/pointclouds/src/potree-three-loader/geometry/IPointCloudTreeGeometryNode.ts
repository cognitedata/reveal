import type { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';
import type { Box3, BufferGeometry, Vector3 } from 'three';

export interface IPointCloudTreeGeometryNode extends IPointCloudTreeNodeBase {
  geometry: BufferGeometry | undefined;
  failed: boolean;
  load: () => Promise<void>;
  baseUrl: () => string;
  fileName: () => string;
  oneTimeDisposeHandlers: (() => void)[];

  doneLoading: (bufferGeometry: BufferGeometry, _tightBoundingBox: Box3, np: number, _mean: Vector3) => void;
}
