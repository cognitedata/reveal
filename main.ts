import { ThreeModule } from './src/Three/ThreeModule';
import { PolylinesNode } from './src/Core/Geometry/PolylinesNode';
import { Polylines } from './src/Core/Geometry/Polylines';

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

  for (let i = 0; i < 1; i++)
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
}

