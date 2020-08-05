
import * as THREE from "three";

import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import Icon from "@images/Nodes/Plane.png"
import { BaseNode } from '@/Core/Nodes/BaseNode';
import { SeismicPlaneNode } from '@/SubSurface/Seismic/Nodes/SeismicPlaneNode';
import { ThreeConverter } from '@/Three/Utilities/ThreeConverter';
import { Vector3 } from '@/Core/Geometry/Vector3';
import { Index3 } from '@/Core/Geometry/Index3';
import { NodeEventArgs } from '@/Core/Views/NodeEventArgs';
import { Changes } from '@/Core/Views/Changes';

export class PlaneToolCommand extends ToolCommand
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _capureNode: BaseNode | null = null;
  private _startPoint: THREE.Vector3 | null = null;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getName(): string { return "Plane manipulation" }
  public /*override*/ getIcon(): string { return Icon; }

  //==================================================
  // OVERRIDES of ToolCommand
  //==================================================

  public /*override*/ overrideLeftButton(): boolean { return true; }

  public /*override*/ onMouseDown(event: MouseEvent): void
  {
    const target = this.target;
    if (!target)
      return;

    const pixel = target.getMouseRelativePositionThree(event);
    const intersection = target.getIntersection(pixel);
    if (!intersection)
      return;

    const node = target.getNodeByObject(intersection.object);
    if (!node)
      return;

    const planeNode = node as SeismicPlaneNode;
    if (!planeNode)
      return;

    this._capureNode = planeNode;
    const startPixel = ThreeConverter.fromThreeVector2(pixel);
    this._startPoint = intersection.point;
  }

  public /*override*/ onMouseDrag(event: MouseEvent): void
  {
    const target = this.target;
    if (!target)
      return;

    const planeNode = this._capureNode as SeismicPlaneNode;
    if (!planeNode)
      return;

    if (!this._startPoint)
      return;

    var cube = planeNode.surveyCube;
    if (!cube)
      return;

    const pixel = target.getMouseRelativePositionThree(event);
    const ray = target.getRay(pixel);
    if (!ray)
      return;

    const normal = planeNode.normal;
    const up = Vector3.newUp;
    const perpedicularNormal = normal.getCross(up);

    const perpedicularPlane = new THREE.Plane();
    perpedicularPlane.setFromNormalAndCoplanarPoint(ThreeConverter.toThreeVector3(perpedicularNormal), this._startPoint);

    const intersection = new THREE.Vector3();
    if (!ray.intersectPlane(perpedicularPlane, intersection))
      return;

    const transformer = target.transformer;
    const position = transformer.toWorld(intersection);
    const resultCell = Index3.newZero;
    cube.getCellFromPosition(position, resultCell);

    const perpendicularIndex = resultCell.getAt(planeNode.perpendicularAxis);
    if (planeNode.moveTo(perpendicularIndex))
      planeNode.notify(new NodeEventArgs(Changes.geometry));
  }

  public /*override*/ onMouseUp(event: MouseEvent): void
  {
    this._capureNode = null;
    this._startPoint = null;
  }
}