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

export class SeismicCubePlaneManipulator extends BaseManipulator
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _capureNode: SeismicPlaneNode | null = null;
  private _perpedicularPlane: THREE.Plane | null = null;

  //==================================================
  // OVERRIDES of BaseTool
  //==================================================

  public /*override*/ clear(): void
  {
    this._capureNode = null;
    this._perpedicularPlane = null;
  }

  public /*override*/ onMouseDown(target: ThreeRenderTargetNode, node: BaseNode, intersection: THREE.Intersection, ray: THREE.Ray): boolean
  {
    const planeNode = node as SeismicPlaneNode;
    if (!planeNode)
      return false;

    this._capureNode = planeNode;
    this._perpedicularPlane = new THREE.Plane();

    const planeNormal = planeNode.normal;
    let perpedicularPlaneNormal = ThreeConverter.fromThreeVector3(ray.direction);
    const cosAngle = planeNormal.getDot(perpedicularPlaneNormal);
    const angle = Math.acos(Math.abs(cosAngle));

    // When the plane normal and ray are close to colinear
    if (angle < Math.PI / 10)
    {
      perpedicularPlaneNormal = planeNormal;
      perpedicularPlaneNormal.z -= Math.sign(cosAngle);
      perpedicularPlaneNormal.normalize();
    }
    this._perpedicularPlane.setFromNormalAndCoplanarPoint(ThreeConverter.toThreeVector3(perpedicularPlaneNormal), intersection.point);
    return true;
  }

  public /*override*/ onMouseDrag(target: ThreeRenderTargetNode, ray: THREE.Ray, finished: boolean): void
  {
    const planeNode = this._capureNode as SeismicPlaneNode;
    if (!planeNode)
      return;

    if (!this._perpedicularPlane)
      return;

    const cube = planeNode.surveyCube;
    if (!cube)
      return;

    const intersection = new THREE.Vector3();
    if (!ray.intersectPlane(this._perpedicularPlane, intersection))
      return;

    const { transformer } = target;
    const position = transformer.toWorld(intersection);
    const resultCell = Index3.newZero;
    cube.getCellFromPosition(position, resultCell);

    const perpendicularIndex = resultCell.getAt(planeNode.perpendicularAxis);
    if (planeNode.moveTo(perpendicularIndex))
    {
      planeNode.notify(new NodeEventArgs(Changes.geometry));
      target.viewInfo.clear();
      target.viewInfo.addText(`Moving plane \`${planeNode.name}\` to index ${planeNode.perpendicularIndex + 1}.`);
      target.invalidate();
    }
    if (finished)
      planeNode.notify(new NodeEventArgs(Changes.nodeName));
  }
}