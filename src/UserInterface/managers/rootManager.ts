import { Range3 } from "../../Core/Geometry/Range3";
import { ThreeModule } from "../../Three/ThreeModule";
import { ThreeRenderTargetNode } from "../../Three/Nodes/ThreeRenderTargetNode";
import { RootNode } from "../../Nodes/TreeNodes/RootNode";
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";

// Manages Root Node
export default class RootManager {
  static module: ThreeModule;
  static RENDER_TARGETS = 1;
  static appendedViewers: string[] = [];

  // Create Root Node
  static createRoot(): RootNode {
    RootManager.module = new ThreeModule();
    RootManager.module.install();
    return RootManager.module.createRoot() as RootNode;
  }

  // Add 3D and 2D viewer
  static addTargets(root: RootNode): void {
    for (let idx = 0; idx < RootManager.RENDER_TARGETS; idx++) {
      const range = Range3.createByMinAndMax(0, 0, 1, 1);
      const target = new ThreeRenderTargetNode(range);
      target.name = "3d";
      root.targets.addChild(target);
    }
  }

  // Initialize when populated
  static initializeWhenPopulated(root: RootNode) {
    RootManager.module.initializeWhenPopulated(root);
  }

  // Check for available canvas
  static isCanvasAvailable(canvasName: string) {
    return this.appendedViewers.indexOf(canvasName) >= 0;
  }

  // Setup window
  static appendDOM(
    root: RootNode,
    parentElementId: string,
    targetName?: string
  ) {
    const parent = document.getElementById(parentElementId);
    for (const target of root.targets.getChildrenByType(
      ThreeRenderTargetNode
    )) {
      if (parent && target.name === targetName) {
        parent.appendChild(target.domElement);
        target.setActiveInteractive();
        this.appendedViewers.push(target.name);
      }
    }
  }

  // View all nodes
  static viewNodes(root: RootNode) {
    //const target = root.activeTarget as BaseRenderTargetNode;
    //if (target)
    //  target.viewAll();
  }
}
