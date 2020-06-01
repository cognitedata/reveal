import { Range3 } from "../../Core/Geometry/Range3";
import { ThreeModule } from "../../Three/ThreeModule";
import { ThreeRenderTargetNode } from "../../Three/Nodes/ThreeRenderTargetNode";
import { RootNode } from "../../Nodes/TreeNodes/RootNode";
import { Toolbar } from "@/UserInterface/components/Viewers/VisualizerToolbar";

// Manages Root Node
export default class RootManager {
  private static module: ThreeModule;
  private static root: RootNode;
  private static RENDER_TARGETS = 1;
  private static appendedViewers: string[] = [];

  // Create Root Node
  static createRoot(): RootNode {
    RootManager.module = new ThreeModule();
    RootManager.module.install();
    return RootManager.module.createRoot() as RootNode;
  }

  /**
   * Should only be call onced root is ready to be displayed
   */
  public static getRoot(): RootNode {
    if (!RootManager.root) {
      throw Error("Need to call createRoot() and do necessary loading before acquiring root!");
    }
    return RootManager.root;
  }

  /**
   * Load root with actual data
   */
  public static loadData(): void {

  }

  /**
   * Initialize viewers with 3d element here
   * @param element 
   */
  public static initializeViewer(element: HTMLElement): void {

  }

  // Add 3D and 2D viewer
  static addTargets(root: RootNode, setToolBars: (visualizerToolBar: { id: string, toolBar: Toolbar }) => void): void {
    for (let idx = 0; idx < RootManager.RENDER_TARGETS; idx++) {
      const range = Range3.createByMinAndMax(0, 0, 1, 1);
      const target = new ThreeRenderTargetNode(range);
      target.name = "3d";
      const toolBar = new Toolbar();
      target.addTools(toolBar);
      root.targets.addChild(target);
      setToolBars({ id: "3d", toolBar });
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
}
