
import { ThreeModule } from "../../Three/ThreeModule";
import { PolylinesNode } from "../../Nodes/PolylinesNode";
import { Polylines } from "../../Core/Geometry/Polylines";
import { PotreeNode } from "../../Nodes/PotreeNode";
import { SurfaceNode } from "../../Nodes/SurfaceNode";
import { RegularGrid2 } from "../../Core/Geometry/RegularGrid2";
import { ThreeRenderTargetNode } from "../../Three/ThreeRenderTargetNode";
import { Range3 } from "../../Core/Geometry/Range3";
import { WellNode } from "../../Nodes/WellNode";
import { Well } from "../../Nodes/Well";
import { PointsNode } from "../../Nodes/PointsNode";
import { Points } from "../../Core/Geometry/Points";
import { ColorType } from "../../Core/Enums/ColorType";
import { Colors } from "../../Core/PrimitivClasses/Colors";

let module;
let root;

export function generateRoot()
{
  // Create the module and initialize it
  module = new ThreeModule();
  module.install();
  root = module.createRoot();
  const range = Range3.createByMinAndMax(0, 0.5, 1, 1);
  const target = new ThreeRenderTargetNode(range);
  root.targetFolder.addChild(target);
  module.initializeWhenPopulated(root);
  return root;
}

export function appendChildren()
{
  for (const target of root.targetFolder.getChildrenByType(ThreeRenderTargetNode))
  {
    const range = target.pixelRange;
    const stats = target.stats;
    // stats.dom.style.left = range.x.min.toFixed(0) + "px";
    // stats.dom.style.top = range.y.min.toFixed(0) + "px";
    // stats.dom.style.position = "absolute";
    // stats.dom.style.background = "yellow";
    document.getElementById("right-panel")?.appendChild(target.domElement);
    // document.getElementById("right-panel")?.appendChild(stats.dom);
  }
}

export function generatePointNodes()
{
  let nodesObj = {};
  for (let i = 0; i < 1; i++)
  {
    const range = Range3.newTest;
    range.expandByFraction(-0.3);
    const node = new PointsNode();
    nodesObj[node.uniqueId.toString()] = { node, type: "Point", isVisible: false };
    node.data = Points.createByRandom(2000000, range);
    root.dataFolder.addChild(node);
  }
  return nodesObj;
}

export function generatePolylinesNodes()
{
  let nodesObj = {};
  for (let i = 0; i < 1; i++)
  {
    const range = Range3.newTest;
    range.expandByFraction(-0.2);
    const node = new PolylinesNode();
    nodesObj[node.uniqueId.toString()] = { node, type: "Pollyline", isVisible: false };
    node.data = Polylines.createByRandom(20, 10, range);
    root.dataFolder.addChild(node);
  }
  return nodesObj;
}

export function generateSubsurfaceNodes()
{
  let nodesObj = {};
  for (let i = 0; i < 1; i++)
  {
    const node = new SurfaceNode();
    nodesObj[node.uniqueId.toString()] = { node, type: "Subsurface", isVisible: false };
    node.data = RegularGrid2.createFractal(Range3.newTest, 8, 0.8, 2);
    root.dataFolder.addChild(node);
  }
  return nodesObj;
}

export function generateWellNodes()
{
  let nodesObj = {};
  for (let i = 0; i < 10; i++)
  {
    const node = new WellNode();
    nodesObj[node.uniqueId.toString()] = { node, type: "Well" };
    node.data = Well.createByRandom(20, Range3.newTest);
    root.dataFolder.addChild(node);
  }
  return nodesObj;
}
