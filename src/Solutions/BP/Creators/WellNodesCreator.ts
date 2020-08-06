import { WellNode } from "@/SubSurface/Wells/Nodes/WellNode";
import BPData from "@/Solutions/BP/BPData";
import WellNodeCreator from "@/Solutions/BP/Creators/WellNodeCreator";
import WellTrajectoryNodeCreator from "@/Solutions/BP/Creators/WellTrajectoryNodeCreator";
import WellLogCreator from "@/Solutions/BP/Creators/WellLogCreator";
import WellCasingCreator from "@/Solutions/BP/Creators/WellCasingCreator";
import { Util } from "@/Core/Primitives/Util";
import { Units } from "@/Core/Primitives/Units";

export default class WellNodesCreator
{
  static create(bpData: BPData | null): WellNode[] | null
  {
    if (!bpData)
      return null;

    const { wellMap } = bpData;

    if (!wellMap || wellMap.size === 0)
      return null;

    const wellNodeMap = new Map<number, WellNode>();
    const wellNodes: WellNode[] = [];

    for (const wellData of wellMap.values())
    {
      const wellNode = WellNodeCreator.create(wellData);
      if (!wellNode)
        continue;

      wellNodeMap.set(wellData.id, wellNode);
      wellNodes.push(wellNode);
    }
    if (!wellNodes.length)
      return null;

    const { trajectoryMap } = bpData;
    if (!trajectoryMap || !(trajectoryMap.size > 0))
      return wellNodes;

    const { wellBoreToWellMap } = bpData;
    if (!wellBoreToWellMap || !(wellBoreToWellMap.size > 0))
      return wellNodes;

    const { trajectoryDataMap } = bpData;
    if (!trajectoryDataMap || !(trajectoryDataMap.size > 0))
      return wellNodes;

    const { wellBoreToNDSEventsMap } = bpData;
    const { wellBoreToNPTEventsMap } = bpData;
    const { wellBoreToLogsMap } = bpData;
    const { wellBoreToCasingDataMap } = bpData;

    for (const trajectory of trajectoryMap.values())
    {
      const wellBoreId = trajectory.assetId;
      const wellBoreToWell = wellBoreToWellMap.get(wellBoreId);
      if (!wellBoreToWell)
        continue;

      const wellNode = wellNodeMap.get(wellBoreToWell.wellId);
      if (!wellNode)
        continue;

      const { metadata } = wellBoreToWell.data;
      wellNode.elevationType = metadata.elevation_type; //KB
      const elevationUnit = metadata.elevation_value_unit;
      let elevation = Util.getNumberWithUnit(metadata.elevation_value, elevationUnit);
      if (Number.isNaN(elevation))
        elevation = 0;

      const unit = Units.isFeet(elevationUnit) ? Units.Feet : 1;
      const trajectoryRows = trajectoryDataMap.get(trajectory.id);
      const trajectoryNode = WellTrajectoryNodeCreator.create(bpData.trajectoryDataColumnIndexes, trajectoryRows, elevation, unit);
      if (!trajectoryNode)
        continue;

      if (!Util.isEmpty(wellBoreToWell.data.name))
        trajectoryNode.name = wellBoreToWell.data.name;

      wellNode.addChild(trajectoryNode);

      if (wellBoreToNDSEventsMap)
      {
        const events = wellBoreToNDSEventsMap.get(wellBoreId);
        const logNode = WellLogCreator.createRiskLogNode(events);
        if (logNode)
        {
          logNode.name = "NDS Risk Events";
          trajectoryNode.addChild(logNode);
        }
      }
      if (wellBoreToNPTEventsMap)
      {
        const events = wellBoreToNPTEventsMap.get(wellBoreId);
        const logNode = WellLogCreator.createRiskLogNode(events);
        if (logNode)
        {
          logNode.name = "NPT Risk Events";
          trajectoryNode.addChild(logNode);
        }
      }
      if (wellBoreToCasingDataMap)
      {
        const casingData = wellBoreToCasingDataMap.get(wellBoreId);
        const logNode = WellCasingCreator.createCasingNodeNew(casingData, unit);
        if (logNode)
        {
          logNode.name = "Casing";
          trajectoryNode.addChild(logNode);
        }
      }
      if (wellBoreToLogsMap)
        WellLogCreator.addLogNodes(trajectoryNode, wellBoreToLogsMap[wellBoreId], unit);

    }
    return wellNodes;
  }
}
