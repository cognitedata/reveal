import { BaseRootNode } from "../../Core/Nodes/BaseRootNode";
import { StubModule } from "./StubModule";
import { StubTargetNode } from "./StubTargetNode";
import { PolylinesNode } from "../../Nodes/PolylinesNode";
import { Polylines } from "../../Core/Geometry/Polylines";
import { Range3 } from "../../Core/Geometry/Range3";

export class StubRootCreator
{
  public static createTestRoot(): BaseRootNode 
  {
    // Create the module
    const module = new StubModule();
    module.install();

    const root = module.createRoot();

    // Create the viewers
    const target = new StubTargetNode();
    root.targetFolder.addChild(target);
    target.initialize();
    // Create some data
    for (let i = 0; i < 4; i++)
    {
      const node = new PolylinesNode();
      node.data = Polylines.createByRandom(10, 10, Range3.newTest);
      root.dataFolder.addChild(node);
    }
    module.initializeWhenPopulated(root);
    return root;
  }
}

