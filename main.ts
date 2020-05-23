

import { Range1 } from "./src/Core/Geometry/Range1";
import { Range3 } from "./src/Core/Geometry/Range3";
import { Vector3 } from "./src/Core/Geometry/Vector3";

import { ThreeModule } from "./src/Three/ThreeModule";
import { ThreeRenderTargetNode } from "./src/Three/Nodes/ThreeRenderTargetNode";

import { RootNode } from "./src/Nodes/TreeNodes/RootNode";
import { AxisNode } from "./src/Nodes/Decorations/AxisNode";

import { WellTrajectoryNode } from "./src/Nodes/Wells/Wells/WellTrajectoryNode";
import { WellNode } from "./src/Nodes/Wells/Wells/WellNode";
import { WellTrajectory } from "./src/Nodes/Wells/Logs/WellTrajectory";

import { PointLogNode } from "./src/Nodes/Wells/Wells/PointLogNode";
import { FloatLogNode } from "./src/Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "./src/Nodes/Wells/Wells/DiscreteLogNode";

import { PointLog } from "./src/Nodes/Wells/Logs/PointLog";
import { FloatLog } from "./src/Nodes/Wells/Logs/FloatLog";
import { DiscreteLog } from "./src/Nodes/Wells/Logs/DiscreteLog";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { Random } from "@/Core/Primitives/Random";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";



main();

export function main() {

  // Create the module and initialize it
  const module = new ThreeModule();
  module.install();

  const root = module.createRoot() as RootNode;
  const wellTree = root.wells;

  // Add some random wells
  for (let i = 0; i < 40; i++) {
    const well = new WellNode();
    wellTree.addChild(well);

    well.wellHead = Vector3.getRandom(Range3.newTest);
    well.wellHead.z = 0;
    well.name = `well ${i + 1}`;

    // Add some random trajectories to the well
    for (let j = 0; j < 5; j++) {
      const wellTrajectory = new WellTrajectoryNode();
      wellTrajectory.name = `Traj ${i + 1}`;

      wellTrajectory.data = WellTrajectory.createByRandom(well.wellHead);
      well.addChild(wellTrajectory);


      // Add some random float logs to the trajectory
      let n = 1//Random.getInt2(0, 1);
      n = 1;
      for (let k = 0; k < n; k++) {
        const mdRange = wellTrajectory.data.mdRange.clone();
        mdRange.expandByFraction(-0.05);
        const logNode = new CasingLogNode();
        logNode.data = FloatLog.createCasingByRandom(mdRange, 7);
        wellTrajectory.addChild(logNode);
      }
      // Add some random float logs to the trajectory
      n = Random.getInt2(2, 5);
      for (let k = 0; k < n; k++) {
        const mdRange = wellTrajectory.data.mdRange.clone();
        mdRange.min = (mdRange.center + mdRange.min) / 2;
        mdRange.expandByFraction(Random.getFloat2(-0.15, 0));

        const logNode = new FloatLogNode();
        const valueRange = new Range1(0, 3.14);
        logNode.data = FloatLog.createByRandom(mdRange, valueRange);
        wellTrajectory.addChild(logNode);
      }
      // Add some random discrete logs to the trajectory
      n = 1;//Random.getInt2(0, 1);
      for (let k = 0; k < n; k++) {
        const mdRange = wellTrajectory.data.mdRange.clone();
        mdRange.min = (mdRange.center + mdRange.min) / 2;
        mdRange.expandByFraction(Random.getFloat2(-0.25, 0));

        const logNode = new DiscreteLogNode();
        const valueRange = new Range1(0, 4);
        logNode.data = DiscreteLog.createByRandom(mdRange, valueRange);
        wellTrajectory.addChild(logNode);
      }
      // Add some random point logs to the trajectory

      n = Random.getInt2(1, 2);

      for (let k = 0; k < n; k++) {
        const mdRange = wellTrajectory.data.mdRange.clone();
        mdRange.min = (mdRange.center + mdRange.min) / 2;
        mdRange.expandByFraction(Random.getFloat2(-0.15, 0));

        const logNode = new PointLogNode();
        logNode.data = PointLog.createByRandom(mdRange, 10);
        wellTrajectory.addChild(logNode);
      }
    }
  }
  // Add a render target
  {
    const range = Range3.createByMinAndMax(0, 0, 1, 1);
    const target = new ThreeRenderTargetNode(range);
    root.targets.addChild(target);
  }

  module.initializeWhenPopulated(root);
  for (const target of root.targets.getChildrenByType(ThreeRenderTargetNode)) {
    const range = target.pixelRange;
    const stats = target.stats;
    stats.dom.style.left = range.x.min.toFixed(0) + "px";
    stats.dom.style.top = range.y.min.toFixed(0) + "px";
    stats.dom.style.margin = "10px";
    stats.dom.style.position = "absolute";

    document.body.appendChild(target.domElement);
    document.body.appendChild(stats.dom);
    target.setActiveInteractive();
  }

  // Set some nodes visible
  for (const well of root.getDescendantsByType(WellNode)) {
    for (const wellTrajectory of well.getDescendantsByType(WellTrajectoryNode)) {
      wellTrajectory.setVisibleInteractive(true);
      for (const node of wellTrajectory.getDescendantsByType(BaseLogNode))
        node.setVisibleInteractive(true);
      break;
    }
  }
  for (const node of root.getDescendantsByType(AxisNode))
    node.setVisibleInteractive(true);

  // View all
  const activeTarget = root.activeTarget as ThreeRenderTargetNode;
  if (activeTarget)
    activeTarget.viewAll();

  setInterval(() => toggleSomeLogs(root), 100);
}




// Old test code:
//===============

//import { PolylinesNode } from './src/Nodes/PolylinesNode';
//import { PotreeNode } from './src/Nodes/PotreeNode';
//import { SurfaceNode } from './src/Nodes/SurfaceNode';
//import { PointsNode } from './src/Nodes/PointsNode';
//import { Points } from './src/Core/Geometry/Points';
//import { ColorType } from './src/Core/Enums/ColorType';
//import { Colors } from './src/Core/Primitives/Colors';
//{
//  const range = Range3.createByMinAndMax(0, 0.5, 1, 1);
//  const target = new ThreeRenderTargetNode(range);
//  root.targets.addChild(target);
//}
// Add data
//for (let i = 0; i < 1; i++)
//{
//  const range = Range3.newTest;
//  range.expandByFraction(-0.3);
//  const node = new PointsNode();
//  node.data = Points.createByRandom(2_000_000, range);
//  root.dataFolder.addChild(node);
//}
//for (let i = 0; i < 1; i++)
//{
//  const range = Range3.newTest;
//  range.expandByFraction(-0.2);
//  const node = new PolylinesNode();
//  node.data = Polylines.createByRandom(20, 10, range);
//  root.dataFolder.addChild(node);
//}
//for (let i = 0; i < 1; i++)
//{
//  const node = new SurfaceNode();
//  node.data = RegularGrid2.createFractal(Range3.newTest, 8, 0.8, 2);
//  root.dataFolder.addChild(node);
//}
//{
//  const node = new PotreeNode();
//  //node.url = 'https://betaserver.icgc.cat/potree12/resources/pointclouds/barcelonasagradafamilia/cloud.js';
//  //node.name = 'Barcelona';
//  node.url = '/Real/ept.json';
//  node.name = 'Aerfugl';
//  root.dataFolder.addChild(node);
//}
//for (const node of root.getDescendantsByType(PotreeNode))
//  node.setVisible(true);
// Set some visible in target 1
// root.targets.children[0].setActiveInteractive();
//for (const node of root.getDescendantsByType(PointsNode))
//{
//  const style = node.renderStyle;
//  if (style)
//  {
//    style.colorType = ColorType.DepthColor;
//    style.size = 1;
//  }
//  node.setVisible(true);
//}
//for (const node of root.getDescendantsByType(PolylinesNode))
//{
//  const style = node.renderStyle;
//  if (style)
//    style.lineWidth = 10;
//  node.setVisible(true);
//}
//
//for (const node of root.getDescendantsByType(SurfaceNode))
//{
//  const style = node.renderStyle;
//  if (style)
//  {
//    style.colorType = ColorType.DepthColor;
//  }
//  node.setVisible(true);
//}



function toggleSomeLogs(root: RootNode) {
  for (const node of root.wells.getDescendantsByType(BaseLogNode)) {

    const trajectoryNode = node.trajectoryNode;
    if (!trajectoryNode)
      continue;

    if (!trajectoryNode.isVisible())
      continue;

    if (Random.isTrue(0.975))
      node.toogleVisibleInteractive();
  }
  const target = root.activeTarget as BaseRenderTargetNode;
  if (target)
    target.invalidate();
}


