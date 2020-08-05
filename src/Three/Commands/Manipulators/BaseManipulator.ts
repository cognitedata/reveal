import { ThreeRenderTargetNode } from '@/Three/Nodes/ThreeRenderTargetNode';
import { BaseNode } from '@/Core/Nodes/BaseNode';

export abstract class BaseManipulator
{
  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ clear(): void { }
  public /*virtual*/ onMouseDown(target: ThreeRenderTargetNode, node: BaseNode, intersection: THREE.Intersection): boolean { return false; }
  public /*virtual*/ onMouseDrag(target: ThreeRenderTargetNode, ray: THREE.Ray, finished: boolean): void { }
}
