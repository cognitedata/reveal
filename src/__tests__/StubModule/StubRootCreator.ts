import { RootNode } from "../../Core/Nodes/RootNode";
import { StubModule } from "./StubModule";
import { StubTargetNode } from "./StubTargetNode";
import { PolylinesNode } from "../../Core/Geometry/PolylinesNode";
import { Polylines } from "../../Core/Geometry/Polylines";

export class StubRootCreator
{
  public static createTestRoot(): RootNode 
  {
    // Create the module
    const module = new StubModule();
    module.install();

    const root = module.createRoot();

    // Create the viewers
    if (root.targetFolder)
    {
      const target = new StubTargetNode();
      root.targetFolder.addChild(target);
      let i = 0;
      for (const child of root.targetFolder.children)
        child.name = "Target " + i++;

      target.initialize();
    }
    // Create some data
    if (root.dataFolder)
    {
      for (let i = 0; i < 4; i++)
      {
        const node = new PolylinesNode();
        node.data = Polylines.createByRandom(10, 10);
        node.name = "Polylines " + i;
        root.dataFolder.addChild(node);
      }
    }
    return root;
  }
}

