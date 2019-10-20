import { RevealModule } from "../Specific/RevealModule";
import { RootNode } from "../Nodes/RootNode";
import { PolylinesNode } from "../Specific/PolylinesNode";
import { FolderNode } from "../Nodes/FolderNode";
import { RevealTargetNode } from "../Specific/RevealTargetNode";
import { TargetNode } from "../Nodes/TargetNode";
import { BaseNode } from "../Nodes/BaseNode";
import { Polylines } from "../Geometry/Polylines";

export class RootCreator
{
  createRevealRoot(): RootNode 
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

