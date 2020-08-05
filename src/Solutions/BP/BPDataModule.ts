import { BaseModule } from "@/Core/Module/BaseModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { SubSurfaceRootNode } from "@/SubSurface/Trees/SubSurfaceRootNode";
import { ILog, ICasing, IWell, IWellBore, ITrajectory, ITrajectoryRows, IRiskEvent } from "@cognite/subsurface-interfaces";
import BPData from "@/Solutions/BP/BPData";
import WellsCreator from "@/Solutions/BP/Creators/WellNodesCreator";

export default class BPDataModule extends BaseModule
{

    // Represent data of BP
    private bpData: BPData | null = null;

    //==================================================
    // OVERRIDES of BaseModule
    //==================================================

    public /*override*/ createRoot(): BaseRootNode | null
    {
      return new SubSurfaceRootNode();
    }

    public /*override*/ loadData(root: BaseRootNode): void
    {
      if (!(root instanceof SubSurfaceRootNode))
        return;
        // todo: clear rootNode if needed in the future using proper function

      const wellNodes = WellsCreator.create(this.bpData);
      if (!wellNodes)
        return;

      if (!wellNodes.length)
        return;

      const wellTree = root.wells;
      for (const node of wellNodes)
        wellTree.addChild(node);
      wellTree.synchronize();
    }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    public setModuleData(data: {
        wells: IWell[],
        wellBores: IWellBore[],
        trajectories: ITrajectory[],
        trajectoryData?: ITrajectoryRows[]
        ndsEvents?: IRiskEvent[],
        nptEvents?: IRiskEvent[],
        logs?: { [key: number]: ILog[] } | {},
        casings?: ICasing[],
    }) {
      const { wells, wellBores, trajectories, trajectoryData, ndsEvents, nptEvents, logs, casings } = data;
      this.bpData = new BPData(wells, wellBores, trajectories, trajectoryData, ndsEvents, nptEvents, logs, casings);
    }
}
