
import { ThreeModule } from "../Three/ThreeModule";
import { RootNode } from "../Nodes/RootNode";
import { PolylinesNode } from "../Example/PolylinesNode";
import { ThreeTargetNode } from "../Three/ThreeTargetNode";
import { Polylines } from "../Example/Polylines";

export class RootCreator
{
  public static createThreeRoot(): RootNode 
  {
    // Create the module
    const module = new ThreeModule();
    module.install();

    const root = module.createRoot();

    // Create the viewers
    if (root.targetFolder)
    {
      const target = new ThreeTargetNode();
      root.targetFolder.addChild(target);
      let i = 0;
      for (const child of root.targetFolder.children)
        child.name = "Target " + i++;
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

