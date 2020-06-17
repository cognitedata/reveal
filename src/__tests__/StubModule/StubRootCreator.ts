
import { Range3 } from "@/Core/Geometry/Range3";
import { Polylines } from "@/Core/Geometry/Polylines";
import { PolylinesNode } from "@/Nodes/Misc/PolylinesNode";
import { SubSurfaceRootNode } from "@/Nodes/TreeNodes/SubSurfaceRootNode";
import { StubModule } from "./StubModule";
import { StubTargetNode } from "./StubTargetNode";
import { Modules } from "@/Core/Module/Modules";

export class StubRootCreator
{
  public static createTestRoot(): SubSurfaceRootNode 
  {
    // Create the module
    const modules = Modules.instance;
    modules.add(new StubModule());
    modules.install();

    const root = modules.createRoot() as SubSurfaceRootNode;

    // Create the 2 viewers
    for (let i = 0; i < 2; i++) 
    {
      const node = new StubTargetNode();
      node.isActive = true;
      root.targets.addChild(node);
      node.initialize();
    }
    if (!root.activeTarget)
      throw Error("target is not added properly");

    // Create 4 polylines 
    for (let i = 0; i < 4; i++)
    {
      const node = new PolylinesNode();
      node.data = Polylines.createByRandom(10, 10, Range3.newTest);
      root.others.addChild(node);
      node.initialize();
    }
    modules.initializeWhenPopulated(root);

    // root.debugHierarcy();
    return root;
  }
}

