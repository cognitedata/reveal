import * as utm from "utm";

import NodeFactory from "@/Solutions/BP/NodeFactory";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import BPData from "@/Solutions/BP/BPData";

/**
 * Converts IWell, ITrajectory and IBore to BaseNode
 */
export default class NodeAdaptor {

    // Build node tree from BP data for initial rendering
    static getInitialNodeTree(bpData: BPData | null): WellNode[] | null {

        if (!bpData) {
            return [];
        }
        const wells = bpData.wells;
        if (!wells || !wells.length) {
            return [];
        }
        // Create reference well Vector from first well of the list
        const coordinateRef = wells[0].metadata;
        const xyWellRef = utm.fromLatLon(
            parseFloat(coordinateRef.y_coordinate),
            parseFloat(coordinateRef.x_coordinate)
        );
        const xyWellRefV: Vector3 = new Vector3(xyWellRef.easting, xyWellRef.northing, 0);

        const wellNodeMapping = new Map<number, WellNode>();
        const wellNodes: WellNode[] = wells.map(well => {
            const wellNode = NodeFactory.createWellNode(well, xyWellRefV);
            wellNodeMapping.set(well.id, wellNode);
            return wellNode;
        });

        const trajectories = bpData.trajectories;
        const wellBoreToWellMap = bpData.wellBoreToWellMap;
        const trajectoryDataMap = bpData.trajectoryDataMap;
        
        if (!trajectories || !wellBoreToWellMap || !trajectoryDataMap) {
            return wellNodes;
        }

        // Iterate Trajectoies and build TrajectoryNodes
        for (const trajectory of trajectories) {
            const wellBoreId = trajectory.assetId;
            const wellBoreToWell = wellBoreToWellMap.get(wellBoreId);
            if (!wellBoreToWell) {
                continue;
            }
            const parentWellId = wellBoreToWell.wellId;
            const wellNode = wellNodeMapping.get(parentWellId);
            if (!wellNode) {
                continue;
            }
            const trajectoryRows = trajectoryDataMap.get(trajectory.id);
            if (!trajectoryRows || !trajectoryRows.rows.length) {
                continue;
            }
            // Make trajectory name the relavant parent wellbore description
            const trajectoryName = wellBoreToWell.data.description;
            const trajectoryNode = NodeFactory.createTrajectoryNode(trajectoryName, trajectory, wellNode, trajectoryRows);
            wellNode.addChild(trajectoryNode);
        }
        return wellNodes;
    }
}
