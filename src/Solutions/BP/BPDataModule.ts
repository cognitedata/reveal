import { BaseModule } from "@/Core/Module/BaseModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import NodeAdaptor from "@/Solutions/BP/NodeAdaptor";
import { SubSurfaceRootNode } from "@/Nodes/TreeNodes/SubSurfaceRootNode";
import { WellTreeNode } from "@/Nodes/TreeNodes/WellTreeNode";
import { Well, Wellbore, Trajectory, TrajectoryRows } from "@/Interface";
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

        // Clear Root WellTreeNode
        if (root.hasChildByType(WellTreeNode)) {
            // tslint:disable-next-line: no-console
            console.log("SubsurfaceVisualizer: Cleaning root");
            root.getChildByType(WellTreeNode)?.remove();
            root.addChild(new WellTreeNode());
        }
        const nodeTree = NodeAdaptor.getInitialNodeTree(this.bpData);
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
    }) {
        const { wells, wellBores, trajectories, trajectoryData } = data;
        this.bpData = new BPData(wells, wellBores, trajectories, trajectoryData);
    }
}
