import { PointLogNode } from '../../SubSurface/Wells/Nodes/PointLogNode';
import * as THREE from 'three';
import { BaseManipulator } from '../../Three/Commands/Manipulators/BaseManipulator';
import { ThreeRenderTargetNode } from '../../Three/Nodes/ThreeRenderTargetNode';
import { PointLogView } from '../../ThreeSubSurface/Wells/PointLogView';

import { BaseNode } from '../../Core/Nodes/BaseNode';
import { Changes } from '../../Core/Views/Changes';
import { NodeEventArgs } from '../../Core/Views/NodeEventArgs';

export class PointLogManipulator extends BaseManipulator {
  //= =================================================
  // OVERRIDES of BaseTool
  //= =================================================

  public /* override */ onMouseDown(
    target: ThreeRenderTargetNode,
    node: BaseNode,
    intersection: THREE.Intersection,
    _ray: THREE.Ray
  ): boolean {
    const pointLogNode = node as PointLogNode;
    if (!pointLogNode) return false;

    const index = intersection.object.userData[PointLogView.sphereName];
    if (index === undefined) return false;

    const { trajectory } = pointLogNode;
    if (!trajectory) return false;

    const { log } = pointLogNode;
    if (!log) return false;

    const sample = log.getAt(index);
    if (!sample) return false;

    sample.isOpen = !sample.isOpen;
    node.notify(new NodeEventArgs(Changes.pointOpenOrClosed));
    return false;
  }
}
