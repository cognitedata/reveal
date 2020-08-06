import * as THREE from "three";

import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { SeismicPlaneNode } from '@/SubSurface/Seismic/Nodes/SeismicPlaneNode';
import { ThreeConverter } from '@/Three/Utilities/ThreeConverter';
import { Vector3 } from '@/Core/Geometry/Vector3';
import { Index3 } from '@/Core/Geometry/Index3';
import { NodeEventArgs } from '@/Core/Views/NodeEventArgs';
import { Changes } from '@/Core/Views/Changes';
import { BaseManipulator } from '@/Three/Commands/Manipulators/BaseManipulator';
import { BaseNode } from '@/Core/Nodes/BaseNode';
import { PointLogNode } from "@/SubSurface/Wells/Nodes/PointLogNode";
import { PointLogView } from "@/ThreeSubSurface/Wells/PointLogView";

export class PointLogManipulator extends BaseManipulator
{
  //==================================================
  // OVERRIDES of BaseTool
  //==================================================

  public /*override*/ onMouseDown(target: ThreeRenderTargetNode, node: BaseNode, intersection: THREE.Intersection, ray: THREE.Ray): boolean
  {
    const pointLogNode = node as PointLogNode;
    if (!pointLogNode)
      return false;

    const index = intersection.object.userData[PointLogView.sphereName];
    if (index === undefined)
      return false;

    const { trajectory } = pointLogNode;
    if (!trajectory)
      return false;

    const { log } = pointLogNode;
    if (!log)
      return false;

    const sample = log.getAt(index);
    if (!sample)
      return false;

    sample.isOpen = !sample.isOpen;
    node.notify(new NodeEventArgs(Changes.pointOpenOrClosed));
    return false;
  }
}