import { Object3D } from 'three';
import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';

export class PointCloudTree extends Object3D {
  root: IPointCloudTreeNodeBase | undefined = undefined;

  initialized(): boolean {
    return this.root !== undefined;
  }
}
