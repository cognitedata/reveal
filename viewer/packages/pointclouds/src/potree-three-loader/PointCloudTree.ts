import { Object3D } from 'three';
import { IPointCloudTreeNodeBase } from "./types/IPointCloudTreeNodeBase";

export class PointCloudTree extends Object3D {
  root: IPointCloudTreeNodeBase | undefined = undefined;

  initialized() {
    return this.root !== undefined;
  }
}
