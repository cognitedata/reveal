import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import BPData from "@/Solutions/BP/BPData";
import WellNodeCreator from "@/Solutions/BP/Creators/WellNodeCreator";
import WellTrajectoryNodeCreator from "@/Solutions/BP/Creators/WellTrajectoryNodeCreator";
import WellLogCreator from "@/Solutions/BP/Creators/WellLogCreator";
import { Util } from "@/Core/Primitives/Util";
import { Units } from '@/Core/Primitives/Units';

export default class WellNodesCreator
{
    static create(bpData: BPData | null): WellNode[] | null
    {
        if (!bpData)
            return null;

        const wellsData = bpData.wells;
        if (!wellsData || !wellsData.length)
            return null;

        const wellNodeMap = new Map<number, WellNode>();
        const wellNodes: WellNode[] = [];
        for (const wellData of wellsData)
        {
            const wellNode = WellNodeCreator.create(wellData);
            if (!wellNode)
                continue;

            wellNodeMap.set(wellData.id, wellNode);
            wellNodes.push(wellNode);
        }
        if (!wellNodes.length)
            return null;

        const trajectories = bpData.trajectories;
        if (!trajectories)
            return wellNodes;

        const wellBoreToWellMap = bpData.wellBoreToWellMap;
        if (!wellBoreToWellMap)
            return wellNodes;

        const trajectoryDataMap = bpData.trajectoryDataMap;
        if (!trajectoryDataMap)
            return wellNodes;

        const wellBoreToNDSEventsMap = bpData.wellBoreToNDSEventsMap;
        const wellBoreToNPTEventsMap = bpData.wellBoreToNPTEventsMap;
        const wellBoreToLogsMap = bpData.wellBoreToLogsMap;

        for (const trajectory of trajectories)
        {
            const wellBoreId = trajectory.assetId;
            const wellBoreToWell = wellBoreToWellMap.get(wellBoreId);
            if (!wellBoreToWell)
                continue;

            const wellNode = wellNodeMap.get(wellBoreToWell.wellId);
            if (!wellNode)
                continue;

            const metadata = wellBoreToWell.data.metadata;
            wellNode.elevationType = metadata.elevation_type; //KB
            const elevationUnit = metadata.elevation_value_unit;
            const elevation = Util.getNumberWithUnit(metadata.elevation_value, elevationUnit);
            if (!Number.isNaN(elevation))
                wellNode.wellHead.z = elevation;

            const unit = Units.isFeet(elevationUnit) ? Units.Feet : 1;
            const trajectoryRows = trajectoryDataMap.get(trajectory.id);
            const trajectoryNode = WellTrajectoryNodeCreator.create(bpData.trajectoryDataColumnIndexes, trajectoryRows, elevation, unit);
            if (!trajectoryNode)
                continue;

            if (!Util.isEmpty(wellBoreToWell.data.description))
                trajectoryNode.setName(wellBoreToWell.data.description);

            wellNode.addChild(trajectoryNode);

            if (wellBoreToNDSEventsMap)
            {
                const ndsEvents = wellBoreToNDSEventsMap.get(wellBoreId);
                const ndsEventLog = WellLogCreator.createRiskLogNode(ndsEvents);
                if (ndsEventLog)
                {
                    ndsEventLog.setName("NDS Risk Events");
                    trajectoryNode.addChild(ndsEventLog);
                }
            }
            if (wellBoreToNPTEventsMap)
            {
                const nptEvents = wellBoreToNPTEventsMap.get(wellBoreId);
                const nptEventsLog = WellLogCreator.createRiskLogNode(nptEvents);
                if (nptEventsLog)
                {
                    nptEventsLog.setName("NPT Risk Events");
                    trajectoryNode.addChild(nptEventsLog);
                }
            }
            if (wellBoreToLogsMap)
                WellLogCreator.addLogNodes(trajectoryNode, wellBoreToLogsMap[wellBoreId], unit);
        }
        return wellNodes;
    }
}
