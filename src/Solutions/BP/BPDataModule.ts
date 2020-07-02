import { BaseModule } from "@/Core/Module/BaseModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import NodeAdaptor from "@/Solutions/BP/NodeAdaptor";
import { SubSurfaceRootNode } from "@/Nodes/TreeNodes/SubSurfaceRootNode";
import { Well, Wellbore, Trajectory, TrajectoryRows, RiskEvent, ILog } from "@/Interface";
import BPData from "@/Solutions/BP/BPData";

export default class BPDataModule extends BaseModule {

    // Represent data of BP
    private bpData: BPData | null = null;

    //==================================================
    // OVERRIDES of BaseModule
    //==================================================

    public /*override*/ createRoot(): BaseRootNode | null {
        return new SubSurfaceRootNode();
    }

    public /*override*/ loadData(root: BaseRootNode): void {
        if (!(root instanceof SubSurfaceRootNode))
            return;
        // todo: clear rootNode if needed in the future using proper function

        const nodeTree = NodeAdaptor.getInitialNodeTree(this.bpData);
        // tslint:disable-next-line: no-console
        console.log("NodeVisualizer: Nodetree", nodeTree ? nodeTree.length : 0);
        const wellTree = root.wells;
        if (nodeTree) {
            for (const node of nodeTree) {
                wellTree.addChild(node);
            }
            wellTree.synchronize();
        }
    }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    public setModuleData(data: {
        wells: Well[],
        wellBores: Wellbore[],
        trajectories: Trajectory[],
        trajectoryData?: TrajectoryRows[]
        ndsEvents?: RiskEvent[],
        nptEvents?: RiskEvent[],
        logs?: { [key: number]: ILog[] }
    }) {
        const { wells, wellBores, trajectories, trajectoryData, ndsEvents, nptEvents, logs } = data;
        this.bpData = new BPData(wells, wellBores, trajectories, trajectoryData, ndsEvents, nptEvents, logs);
    }
}
