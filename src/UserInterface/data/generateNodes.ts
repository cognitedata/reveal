import { ThreeModule } from "../../Three/ThreeModule";
import { ThreeRenderTargetNode } from "../../Three/ThreeRenderTargetNode";
import { Range3 } from "../../Core/Geometry/Range3";
import { Range1 } from "../../Core/Geometry/Range1";
import { WellTrajectoryNode } from "../../Nodes/Wells/Wells/WellTrajectoryNode";
import { FloatLogNode } from "../../Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "../../Nodes/Wells/Wells/DiscreteLogNode";
import { WellNode } from "../../Nodes/Wells/Wells/WellNode";
import { WellTrajectory } from "../../Nodes/Wells/Logs/WellTrajectory";
import { FloatLog } from "../../Nodes/Wells/Logs/FloatLog";
import { DiscreteLog } from "../../Nodes/Wells/Logs/DiscreteLog";
import { RootNode } from "../../TreeNodes/RootNode";
import { AxisNode } from "../../Nodes/AxisNode";
import { Vector3 } from "../../Core/Geometry/Vector3";

import { state1 } from "./settings-dummy-state1";
import { state2 } from "./settings-dummy-state2";

let root;

export function generateRoot() {
  // Create the module and initialize it
  const module = new ThreeModule();
  module.install();
  root = module.createRoot() as RootNode;
  const range = Range3.createByMinAndMax(0, 0, 1, 1);
  const target = new ThreeRenderTargetNode(range);
  root.targets.addChild(target);
  module.initializeWhenPopulated(root);
  return root;
}

export function appendChildren() {
  for (const target of root.targets.getChildrenByType(ThreeRenderTargetNode)) {
    document.getElementById("right-panel").appendChild(target.domElement);
    target.setActiveInteractive();
  }
}

export function generateWellNodes() {
  const wellTree = root.wells;
  const wells = {};
  // Add 6 wells
  for (let i = 0; i < 6; i++) {
    const well = new WellNode();
    wells[well.uniqueId.toString()] = {
      node: well,
      type: "Well",
      isVisible: false,
      isSelected: false,
    };
    wellTree.addChild(well);

    well.wellHead = Vector3.getRandom(Range3.newTest);
    well.wellHead.z = 0;

    // Add 5 trajectories
    for (let j = 0; j < 5; j++) {
      const wellTrajectory = new WellTrajectoryNode();
      wellTrajectory.data = WellTrajectory.createByRandom(well.wellHead);
      well.addChild(wellTrajectory);

      const mdRange = wellTrajectory.data.getMdRange();
      mdRange.expandByFraction(-0.05);

      // Add 2 float logs
      for (let k = 0; k < 3; k++) {
        const valueRange = new Range1(0, k + 1 + 0.5);
        const logNode = new FloatLogNode();
        logNode.data = FloatLog.createByRandom(mdRange, valueRange);
        wellTrajectory.addChild(logNode);
      }
      // Add 3 discrete logs
      for (let k = 0; k < 3; k++) {
        const valueRange = new Range1(0, k + 1 + 0.5);
        const logNode = new DiscreteLogNode();
        logNode.data = DiscreteLog.createByRandom(mdRange, valueRange);
        wellTrajectory.addChild(logNode);
      }
    }
  }
  for (const node of root.getDescendantsByType(WellTrajectoryNode)) {
    node.setVisibleInteractive(true);
  }
  for (const node of root.getDescendantsByType(AxisNode)) {
    node.setVisibleInteractive(true);
  }
  for (const node of root.getDescendantsByType(WellTrajectoryNode)) {
    node.toogleVisibleInteractive();
  }
  return wells;
}

export function updateWellNodeVisibility(id, visibility) {
  for (const node of root.getDescendantsByType(WellTrajectoryNode)) {
    if (node.parent.uniqueId.toString() === id) node.toogleVisibleInteractive();
  }
}

export function updateRootNode() {
  const activeTarget = root.activeTarget as ThreeRenderTargetNode;
  if (activeTarget) activeTarget.viewAll();
}

export function generateSettingsConfig(node) {
  // const config = node.getConfig();
  const random = Math.floor(Math.random() * 10) + 1;
  if (random > 5) return state1;
  return state2;
}
