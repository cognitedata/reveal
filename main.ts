import * as THREE from 'three';

import { ThreeModule } from './src/Three/ThreeModule';
import { PolylinesNode } from './src/Nodes/PolylinesNode';
import { Polylines } from './src/Core/Geometry/Polylines';
import { PotreeNode } from './src/Nodes/PotreeNode';
import { SurfaceNode } from './src/Nodes/SurfaceNode';
import { RegularGrid2 } from './src/Core/Geometry/RegularGrid2';
import { Index2 } from './src/Core/Geometry/Index2';
import { Range1 } from './src/Core/Geometry/Range1';
import { ThreeTargetNode } from './src/Three/ThreeTargetNode';

main();

export function main()
{
  // Create the module and initialize it
  const module = new ThreeModule();
  module.install();

  const root = module.createRoot();

  // Add data
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
    node.data = RegularGrid2.createFractal(8, -0, -0, 1, new Range1(0, 100));
    node.data.smoothSimple(2);
    root.dataFolder.addChild(node);
    node.setVisible(true);

    // TODO: Move this to the general code
    const target = root.activeTarget as ThreeTargetNode;
    const range = node.getRange();
    if (target && !range.isEmpty && target.activeCamera instanceof THREE.PerspectiveCamera)
    {
      const camera = target.activeCamera;
      camera.position.set(range.x.center, range.y.center, range.z.center + 1000);
      camera.updateProjectionMatrix();
    }
  }
  module.initializeWhenPopulated(root);

  const domElement = module.getDomElement(root);
  if (domElement)
    document.body.appendChild(domElement);
}



