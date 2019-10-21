
import { RevealModule } from "../Specific/RevealModule";
import { RootNode } from "../Nodes/RootNode";
import { PolylinesNode } from "../Specific/PolylinesNode";
import { RevealTargetNode } from "../Specific/RevealTargetNode";
import { Polylines } from "../Geometry/Polylines";

export class RootCreator
{
  public static createRevealRoot(): RootNode 
  {
    // Create the module
    const module = new RevealModule();
    module.install();

    const root = module.createRoot();

    // Create the viewers
    if (root.targetFolder)
    {
      const target = new RevealTargetNode();
      root.targetFolder.addChild(target);
      let i = 0;
      for (const child of root.targetFolder.children)
        child.name = "target " + i++;
    }
    // Create some data
    if (root.dataFolder)
    {
      for (let i = 0; i < 4; i++)
      {
        const node = new PolylinesNode();
        node.data = Polylines.createByRandom(10, 10);
        node.name = "node " + i;
        root.dataFolder.addChild(node);
      }
    }
    return root;
  }
}

