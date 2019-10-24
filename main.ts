import { ThreeModule } from './src/Three/ThreeModule';
import { PolylinesNode } from './src/Core/Geometry/PolylinesNode';
import { Polylines } from './src/Core/Geometry/Polylines';
import { BaseTargetNode } from './src/Core/Nodes/BaseTargetNode';
import { BaseVisualNode } from './src/Core/Nodes/BaseVisualNode';

main();

export function main()
{
  // Create the module and initialize it
  const module = new ThreeModule();
  module.install();

  const root = module.createRoot();

  // Add some data
  if (!root.dataFolder)
    throw Error("No data folder in the project");

  for (let i = 0; i < 10; i++)
  {
    const node = new PolylinesNode();
    node.data = Polylines.createByRandom(20, 10);
    root.dataFolder.addChild(node);
    node.setVisible(true);
  }
  module.initializeWhenPopulated(root);

  const domElement = module.getDomElement(root);
  if (domElement)
    document.body.appendChild(domElement);

  if (root.targetFolder == null)
    return;
  if (root.dataFolder == null)
    return;

  return;
  // for (const isVisible of [true, false])
  // {
  //   for (const target of root.targetFolder.getChildrenByType(BaseTargetNode))
  //     for (const node of root.dataFolder.getChildrenByType(BaseVisualNode))
  //     {
  //       const sleep = (milliseconds: number) =>
  //       {
  //         return new Promise(resolve => setTimeout(resolve, milliseconds))
  //       }
  //       sleep(10000).then(() =>
  //       {
  //         node.setVisible(isVisible, target);
  //       });
  //     }
  // }
}



