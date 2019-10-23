import * as THREE from 'three';
import { ThreeModule } from './src/Three/ThreeModule';
import { ThreeTargetNode } from './src/Three/ThreeTargetNode';
import { Polylines } from './src/Example/Polylines';
import { PolylinesNode } from './src/Example/PolylinesNode';

main();

export function main()
{
  // Create the module
  const module = new ThreeModule();
  module.install();

  const root = module.createRoot();

  // Create the viewers
  if (!root.targetFolder)
  {
    console.log("Did not get a target folder. Cannot continue");
    return;
  }
  const target = new ThreeTargetNode();
  // TODO should not be added automatically like this?
  document.body.appendChild(target.domElement);
  root.targetFolder.addChild(target);
  let i = 0;
  for (const child of root.targetFolder.children)
    child.name = "Target " + i++;
  // Create some data
  if (!root.dataFolder)
  {
    console.log("Did not get a data folder. Cannot continue");
    return;
  }
  for (let i = 0; i < 4; i++)
  {
    const node = new PolylinesNode();
    node.data = Polylines.createByRandom(10, 10);
    node.name = "Polylines " + i;
    root.dataFolder.addChild(node);
    node.setVisible(true, target);
  }
}

