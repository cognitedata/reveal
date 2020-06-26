import * as utm from "utm";

import NodeFactory from "@/Solutions/BP/NodeFactory";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import BPData from "@/Solutions/BP/BPData";
import { RiskEvent } from "@/Interface";

/**
 * Converts IWell and ITrajectory to BaseNode
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

        // Get WellBore to NDS events map
        const wellBoreToNDSEventsMap = bpData.wellBoreToNDSEventsMap;
        // Get WellBore to NPT events map
        const wellBoreToNPTEventsMap = bpData.wellBoreToNPTEventsMap;
        // Indexes of md,x_offset and y_offset
        const { md, x_offset, y_offset } = bpData.trajectoryDataColumnindexes;
        // tslint:disable-next-line: no-console
        console.log("NodeVisualizer:Data indexes", md, x_offset, y_offset);

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

            let ndsEvents: RiskEvent[] | undefined;
            if (wellBoreToNDSEventsMap) {
                ndsEvents = wellBoreToNDSEventsMap.get(wellBoreId);
                // tslint:disable-next-line: no-console
                console.log("NodeVisualizer: TrajectoryNDSEvent", wellBoreId, ndsEvents);
            }

            let nptEvents: RiskEvent[] | undefined;
            if (wellBoreToNPTEventsMap) {
                nptEvents = wellBoreToNPTEventsMap.get(wellBoreId);
                // tslint:disable-next-line: no-console
                console.log("NodeVisualizer: TrajectoryNPTEvent", wellBoreId, nptEvents);
            }

            // TODO - Move data to a class and reduce arguments
            const trajectoryNode = NodeFactory.createTrajectoryNode(
                trajectoryName, // Relavant wellbore description
                trajectory, // Trajectory data coming from BP
                wellNode, // Parent well node
                trajectoryRows,
                [md, x_offset, y_offset], // Indexces of md, x_offset and y_offset
                ndsEvents,
                nptEvents);
            wellNode.addChild(trajectoryNode);
        }
        return wellNodes;
    }
}
