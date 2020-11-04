import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseNode } from "@/Core/Nodes/BaseNode";

export abstract class BaseManipulator {
  //= =================================================
  // VIRTUAL METHODS
  //= =================================================

  public /* virtual */ clear(): void { }

  public /* virtual */ onMouseDown(_target: ThreeRenderTargetNode, _node: BaseNode, _intersection: THREE.Intersection, _ray: THREE.Ray): boolean { return false; }

  public /* virtual */ onMouseDrag(_target: ThreeRenderTargetNode, _ray: THREE.Ray, _finished: boolean): void { }
}
