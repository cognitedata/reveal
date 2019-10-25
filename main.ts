import { ThreeModule } from './src/Three/ThreeModule';
import { PolylinesNode } from './src/Nodes/PolylinesNode';
import { Polylines } from './src/Core/Geometry/Polylines';
import { PotreeNode } from './src/Nodes/PotreeNode';
import { SurfaceNode } from './src/Nodes/SurfaceNode';
import { RegularGrid2 } from './src/Core/Geometry/RegularGrid2';
import { Index2 } from './src/Core/Geometry/Index2';
import { Range1 } from './src/Core/Geometry/Range1';

main();

export function main()
{
  // Create the module and initialize it
  const module = new ThreeModule();
  module.install();

  const root = module.createRoot();

  for (let i = 0; i < 10; i++)
  {
    const node = new PolylinesNode();
    node.data = Polylines.createByRandom(20, 10, new Range1(-100, 100));
    root.dataFolder.addChild(node);
    node.setVisible(true);
  }
  {
    const node = new PotreeNode();
    node.url = 'https://betaserver.icgc.cat/potree12/resources/pointclouds/barcelonasagradafamilia/cloud.js';
    node.name = 'Barcelona';
    root.dataFolder.addChild(node);
    //node.setVisible(true);
  }
  {
    const node = new SurfaceNode();
    node.data = new RegularGrid2(new Index2(100, 100), -500, -500, 10);
    root.dataFolder.addChild(node);
    node.setVisible(true);
  }
  module.initializeWhenPopulated(root);

  const domElement = module.getDomElement(root);
  if (domElement)
    document.body.appendChild(domElement);


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



