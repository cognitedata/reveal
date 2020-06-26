import WellBuilder from "@/Solutions/BP/builders/WellBuilder";
import WellTrajectoryBuilder from "@/Solutions/BP/builders/WellTrajectoryBuilder";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { TrajectoryRows, Well, Trajectory, RiskEvent } from "@/Interface";
import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";

export default class NodeFactory {

    // Create a WellNode from Well
    static createWellNode(data: Well, xyWellRefV: Vector3): WellNode {
        return new WellBuilder(data as Well).setWellHead(xyWellRefV).getWell();
    }

    // Create a WellTrajectoryNode from Trajectory
    static createTrajectoryNode(
        name: string,
        data: Trajectory,
        well: WellNode,
        trajectoryRows: TrajectoryRows,
        dataIndexes: number[],
        ndsEvents?: RiskEvent[],
        nptEvents?: RiskEvent[]
    ): WellTrajectoryNode {
        return new WellTrajectoryBuilder(name, data)
            .setTrajectoryData(well, dataIndexes, trajectoryRows)
            .addNDSEvents(ndsEvents)
            .addNPTEvents(nptEvents)
            .addCasings()
            .addFloatLogs()
            .addDiscreteLogs()
            .getTrajectory();
    }
}
