import { StubModule } from "./StubModule";
import { StubTargetNode } from "./StubTargetNode";
import { PolylinesNode } from "@/Nodes/PolylinesNode";
import { Polylines } from "@/Core/Geometry/Polylines";
import { Range3 } from "@/Core/Geometry/Range3";
import { RootNode } from "@/TreeNodes/RootNode";

export class StubRootCreator
{
  public static createTestRoot(): RootNode 
  {
    // Create the module
    const module = new StubModule();
    module.install();

    const root = module.createRoot() as RootNode;

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
    module.initializeWhenPopulated(root);

    // root.debugHierarcy();
    return root;
  }
}

