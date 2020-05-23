
import { RootNode } from "../Nodes/TreeNodes/RootNode";

import { WellTrajectoryNode } from "../Nodes/Wells/Wells/WellTrajectoryNode";
import { WellNode } from "../Nodes/Wells/Wells/WellNode";


import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { BaseRootLoader } from "@/RootLoaders/BaseRootLoader";


export class RealDataLoader extends BaseRootLoader {

  //==================================================
  // OVERRIDES of BaseRootLoader
  //==================================================

  public /*override*/ load(root: RootNode): void {
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
  }
}

