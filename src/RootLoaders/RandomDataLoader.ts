import { Range1 } from "../Core/Geometry/Range1";
import { Range3 } from "../Core/Geometry/Range3";
import { Vector3 } from "../Core/Geometry/Vector3";

import { RootNode } from "../Nodes/TreeNodes/RootNode";

import { WellTrajectoryNode } from "../Nodes/Wells/Wells/WellTrajectoryNode";
import { WellNode } from "../Nodes/Wells/Wells/WellNode";
import { WellTrajectory } from "../Nodes/Wells/Logs/WellTrajectory";

import { PointLogNode } from "../Nodes/Wells/Wells/PointLogNode";
import { FloatLogNode } from "../Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "../Nodes/Wells/Wells/DiscreteLogNode";

import { PointLog } from "../Nodes/Wells/Logs/PointLog";
import { FloatLog } from "../Nodes/Wells/Logs/FloatLog";
import { DiscreteLog } from "../Nodes/Wells/Logs/DiscreteLog";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { Random } from "@/Core/Primitives/Random";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";
import { BaseRootLoader } from "@/RootLoaders/BaseRootLoader";
import { RegularGrid2 } from "@/Core/Geometry/RegularGrid2";
import { SurfaceNode } from "@/Nodes/Misc/SurfaceNode";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import THREE from "three";
import { ToggleAxisVisibleCommand } from "@/Three/Commands/ToggleAxisVisibleCommand";
import { ViewAllCommand } from "@/Three/Commands/ViewAllCommand";
import { ToggleBgColorCommand } from "@/Three/Commands/ToggleBgColorCommand";

export class RandomDataLoader extends BaseRootLoader {

  //==================================================
  // OVERRIDES of BaseRootLoader
  //==================================================

  public /*override*/ load(root: RootNode): void {

    const numberOfWells = 20;
    const numberOfTrajectories = 2;

    const wellTree = root.wells;

    // Add some random wells
    for (let wellIndex = 0; wellIndex < numberOfWells; wellIndex++) {

      const wellNode = new WellNode();
      wellTree.addChild(wellNode);

      wellNode.wellHead = Vector3.getRandom(Range3.newTest);
      wellNode.wellHead.z = 0;
      wellNode.name = `well ${wellIndex + 1}`;

      // Add some random trajectories to the well
      for (let trajectoryIndex = 0; trajectoryIndex < numberOfTrajectories; trajectoryIndex++) {
        const trajectoryNode = new WellTrajectoryNode();
        trajectoryNode.name = `Traj ${wellIndex + 1}`;

        trajectoryNode.data = WellTrajectory.createByRandom(wellNode.wellHead);
        wellNode.addChild(trajectoryNode);

        // Add some random casing logs to the trajectory
        let numberOfLogs = Random.getInt2(0, 1);
        for (let logIndex = 0; logIndex < numberOfLogs; logIndex++) {
          const mdRange = trajectoryNode.data.mdRange.clone();
          mdRange.expandByFraction(-0.05);
          const logNode = new CasingLogNode();
          logNode.data = FloatLog.createCasingByRandom(mdRange, 7);
          trajectoryNode.addChild(logNode);
        }

        // Add some random float logs to the trajectory
        numberOfLogs = Random.getInt2(2, 5);
        for (let logIndex = 0; logIndex < numberOfLogs; logIndex++) {
          const mdRange = trajectoryNode.data.mdRange.clone();
          mdRange.min = (mdRange.center + mdRange.min) / 2;
          mdRange.expandByFraction(Random.getFloat2(-0.15, 0));

          const logNode = new FloatLogNode();
          const valueRange = new Range1(0, 3.14);
          logNode.data = FloatLog.createByRandom(mdRange, valueRange);
          trajectoryNode.addChild(logNode);
        }

        // Add some random discrete logs to the trajectory
        numberOfLogs = 1;
        for (let logIndex = 0; logIndex < numberOfLogs; logIndex++) {
          const mdRange = trajectoryNode.data.mdRange.clone();
          mdRange.min = (mdRange.center + mdRange.min) / 2;
          mdRange.expandByFraction(Random.getFloat2(-0.25, 0));

          const logNode = new DiscreteLogNode();
          const valueRange = new Range1(0, 4);
          logNode.data = DiscreteLog.createByRandom(mdRange, valueRange);
          trajectoryNode.addChild(logNode);
        }

        // Add some random point logs to the trajectory
        numberOfLogs = Random.getInt2(0, 2);
        for (let k = 0; k < numberOfLogs; k++) {
          const mdRange = trajectoryNode.data.mdRange.clone();
          mdRange.min = (mdRange.center + mdRange.min) / 2;
          mdRange.expandByFraction(Random.getFloat2(-0.15, 0));

          const logNode = new PointLogNode();
          logNode.data = PointLog.createByRandom(mdRange, 10);
          trajectoryNode.addChild(logNode);
        }
      }
    }
    for (let i = 0; i < 5; i++) {
      const node = new SurfaceNode();
      var range = Range3.newTest.clone();
      range.expandByFraction(0.2);
      range.z.set(-1400, -1800);
      node.data = RegularGrid2.createFractal(range, 7, 0.7, 5);
      root.others.addChild(node);
    }

  }

  public /*override*/  updatedVisible(root: RootNode): void {
    // Set all wells ands logs visible
    for (const well of root.getDescendantsByType(WellNode)) {
      for (const wellTrajectory of well.getDescendantsByType(WellTrajectoryNode)) {
        wellTrajectory.setVisibleInteractive(true);
        for (const node of wellTrajectory.getDescendantsByType(BaseLogNode))
          node.setVisibleInteractive(true);
        break;
      }
    }
    for (const node of root.getDescendantsByType(SurfaceNode)) {
      node.setVisibleInteractive(true);
      break;
    }
  }

  public /*override*/  startAnimate(root: RootNode) {
    setInterval(() => RandomDataLoader.animate(root), 200);
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  private static animate(root: RootNode) {

    const target = root.activeTarget as ThreeRenderTargetNode;
    if (!target)
      return;

    // controls.rotate(Math.PI * 0.02, 0, true);
    // controls.update(0);
    // target.updateLight();

    return;

    if (Random.isTrue(0.05)) {
      const command = new ToggleAxisVisibleCommand(target);
      command.invoke();
    }
    if (Random.isTrue(0.2)) {
      const command = new ViewAllCommand(target);
      command.invoke();
    }
    if (Random.isTrue(0.2)) {
      const command = new ToggleBgColorCommand(target);
      command.invoke();
    }
    for (const node of root.wells.getDescendantsByType(WellTrajectoryNode)) {

      if (Random.isTrue(0.025))
        node.toggleVisibleInteractive();
    }
    for (const node of root.wells.getDescendantsByType(BaseLogNode)) {
      if (Random.isTrue(0.05))
        node.toggleVisibleInteractive();
    }
    if (Random.isTrue(0.05)) {
      var n = Random.getInt2(0, 4);
      var i = 0;
      for (const node of root.getDescendantsByType(SurfaceNode)) {
        node.setVisibleInteractive(i == n);
        i++;
      }
    }
    const controls = target.activeControls;
    if (!controls)
      return;

    // controls.rotate(Math.PI * 0.02, 0, true);
    // controls.update(0);
    // target.updateLight();
  }
}



// Old test code:
//===============

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
