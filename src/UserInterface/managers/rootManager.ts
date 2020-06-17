import { Range3 } from "../../Core/Geometry/Range3";
import { ThreeModule } from "../../Three/ThreeModule";
import { ThreeRenderTargetNode } from "../../Three/Nodes/ThreeRenderTargetNode";
import Toolbar from "@/UserInterface/impl/Toolbar";
import { Modules } from "@/Core/Module/Modules";
import { SyntheticSubSurfaceModule } from "@/Nodes/SyntheticSubSurfaceModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";

// Manages Root Node
export default class RootManager
{
  private static NumberOfRenderTargets = 1;

  static createRoot(): BaseRootNode
  {
    const modules = Modules.instance;
    modules.add(new ThreeModule());
    modules.add(new SyntheticSubSurfaceModule());
    modules.install();
    return modules.createRoot();
  }


  static getTargets(
    root: BaseRootNode,
    elementId: string,
  ): { [key: string]: ThreeRenderTargetNode }
  {
    const targets: { [key: string]: ThreeRenderTargetNode } = {};
    const element = document.getElementById(elementId);
    if (!element)
      return targets;

    for (let index = 0; index < RootManager.NumberOfRenderTargets; index++)
    {
      const range = Range3.createByMinAndMax(0, 0, 1, 1);
      const target = new ThreeRenderTargetNode(range);
      target.setName("3d");
      targets[target.getName()] = target;
      root.targets.addChild(target);
    }
    return targets;
  }

  static getToolbars(root: BaseRootNode): { [key: string]: Toolbar }
  {
    const toolBars: { [key: string]: Toolbar } = {};
    for (const target of root.targets.getChildrenByType(ThreeRenderTargetNode))
    {
      const toolBar = new Toolbar();
      target.addTools(toolBar);
      toolBars[target.getName()] = toolBar;
    }
    return toolBars;
  }

  // Setup window
  static appendDOM(
    root: BaseRootNode,
    parentElementId: string,
    targetName?: string
  )
  {
    const parent = document.getElementById(parentElementId);
    if (!parent)
      return;

    for (const target of root.targets.getChildrenByType(ThreeRenderTargetNode))
    {
      if (target.getName() !== targetName)
        continue;

      parent.appendChild(target.domElement);
      target.setActiveInteractive();
    }
  }
}
