import * as THREE from 'three';

import { ThreeModule } from './src/Three/ThreeModule';
import { PolylinesNode } from './src/Nodes/PolylinesNode';
import { Polylines } from './src/Core/Geometry/Polylines';
import { PotreeNode } from './src/Nodes/PotreeNode';
import { SurfaceNode } from './src/Nodes/SurfaceNode';
import { RegularGrid2 } from './src/Core/Geometry/RegularGrid2';
import { ThreeTargetNode } from './src/Three/ThreeTargetNode';
import { Range3 } from './src/Core/Geometry/Range3';
import { WellNode } from './src/Nodes/WellNode';
import { Well } from './src/Nodes/Well';
import { PointsNode } from './src/Nodes/PointsNode';
import { Points } from './src/Core/Geometry/Points';

main();

export function main()
{
  // Create the module and initialize it
  const module = new ThreeModule();
  module.install();

  const root = module.createRoot();

  // Add data
  for (let i = 0; i < 1; i++)
  {
    const node = new PolylinesNode();
    node.data = Polylines.createByRandom(20, 10, Range3.newTest);
    root.dataFolder.addChild(node);
    node.setVisible(true);
  }
  for (let i = 0; i < 1; i++)
  {
    const node = new PointsNode();
    node.data = Points.createByRandom(1000, Range3.newTest);
    root.dataFolder.addChild(node);
    node.setVisible(true);
  }
  for (let i = 0; i < 10; i++)
  {
    const node = new WellNode();
    node.data = Well.createByRandom(20, Range3.newTest);
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
    
    const boundingBox = Range3.newTest;
    node.data = RegularGrid2.createFractal(boundingBox, 8);
    node.data.smoothSimple(2);
    root.dataFolder.addChild(node);
    node.setVisible(true);

    // TODO: Move this to the general code
    const target = root.activeTarget as ThreeTargetNode;
    const range = root.getBoundingBoxRecursive();

    if (range && target && !range.isEmpty && target.activeCamera instanceof THREE.PerspectiveCamera)
    {
      const camera = target.activeCamera;
      camera.position.set(range.x.center, range.y.center, range.z.center + 1000);
      camera.updateProjectionMatrix();
      camera.updateMatrix();
    }
  }
  module.initializeWhenPopulated(root);

  const domElement = module.getDomElement(root);
  if (domElement)
    document.body.appendChild(domElement);
}



