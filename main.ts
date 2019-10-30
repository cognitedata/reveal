
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
import { ColorType } from './src/Core/Enums/ColorType';
import { Colors } from './src/Core/PrimitivClasses/Colors';

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
    const node = new PointsNode();
    node.data = Points.createByRandom(2_000_000, Range3.newTest);
    root.dataFolder.addChild(node);
  }
  for (let i = 0; i < 1; i++)
  {
    const node = new PolylinesNode();
    node.data = Polylines.createByRandom(20, 10, Range3.newTest);
    root.dataFolder.addChild(node);
  }
  for (let i = 0; i < 1; i++)
  {
    const node = new SurfaceNode();
    node.data = RegularGrid2.createFractal(Range3.newTest, 8, 0.8, 2);
    root.dataFolder.addChild(node);
  }
  for (let i = 0; i < 10; i++)
  {
    const node = new WellNode();
    node.data = Well.createByRandom(20, Range3.newTest);
    root.dataFolder.addChild(node);
  }
  {
    const node = new PotreeNode();
    //node.url = 'https://betaserver.icgc.cat/potree12/resources/pointclouds/barcelonasagradafamilia/cloud.js';
    //node.name = 'Barcelona';
    node.url = '/Real/ept.json';
    node.name = 'Aerfugl';
    root.dataFolder.addChild(node);
  }
  {
    const range = Range3.createByMinAndMax(0, 0, 1, 0.5);
    const target = new ThreeTargetNode(range);
    root.targetFolder.addChild(target)
  }
  {
    const range = Range3.createByMinAndMax(0, 0.5, 1, 1);
    const target = new ThreeTargetNode(range);
    root.targetFolder.addChild(target);
  }

  module.initializeWhenPopulated(root);
  for (const domElement of module.getDomElements(root))
    document.body.appendChild(domElement);


  // Set some visible
  root.targetFolder.children[0].setActiveInteractive();

  for (const node of root.getDescendantsByType(PotreeNode))
    node.setVisible(true);

  const use1 = false;
  if (use1)
  {
    for (const node of root.getDescendantsByType(PointsNode))
    {
      const style = node.renderStyle;
      if (style)
      {
        style.colorType = ColorType.NodeColor;
        style.size = 2;
      }
      node.setVisible(true);
    }
    for (const node of root.getDescendantsByType(PolylinesNode))
    {
      const style = node.renderStyle;
      if (style)
        style.lineWidth = 10;
      node.setVisible(true);
    }
    for (const node of root.getDescendantsByType(SurfaceNode))
    {
      const style = node.renderStyle;
      node.color = Colors.grey;
      if (style)
      {
        style.colorType = ColorType.NodeColor;
      }
      node.setVisible(true);
    }
  }
  let activeTarget = root.activeTarget as ThreeTargetNode;
  if (activeTarget)
    activeTarget.viewAll();

  root.targetFolder.children[1].setActiveInteractive();
  for (const node of root.getDescendantsByType(PointsNode))
  {
    const style = node.renderStyle;
    if (style)
    {
      style.colorType = ColorType.DepthColor;
      style.size = 1;
    }
    //node.setVisible(true);
  }
  for (const node of root.getDescendantsByType(WellNode))
    node.setVisible(true);

  for (const node of root.getDescendantsByType(SurfaceNode))
  {
    const style = node.renderStyle;
    if (style)
    {
      style.colorType = ColorType.DepthColor;
    }
    node.setVisible(true);
  }
  activeTarget = root.activeTarget as ThreeTargetNode;
  if (activeTarget)
    activeTarget.viewAll();

  // Trick
  (window as any).camera = activeTarget.activeCamera;
}



