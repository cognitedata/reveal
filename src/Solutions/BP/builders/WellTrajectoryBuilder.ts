import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import { Trajectory } from "@/Interface/ITrajectory";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { Range1 } from "@/Core/Geometry/Range1";
import { Random } from "@/Core/Primitives/Random";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { DiscreteLog } from "@/Nodes/Wells/Logs/DiscreteLog";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { TrajectoryRows } from "@/Interface";
import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";
import { FTM } from "@/Solutions/BP/Constants";

/**
 * Build WellTrajectoryNode from BP Data
 */
export default class WellTrajectoryBuilder {

    private wellTrajectoryNode: WellTrajectoryNode;
    private wellTrajectoryData: Trajectory;

    // Initialize wellTrajectoryNode
    constructor(name: string, data: Trajectory) {
        this.wellTrajectoryData = data;
        this.wellTrajectoryNode = new WellTrajectoryNode();
        this.wellTrajectoryNode.setName(name);
    }

    // Set trajectory data
    public setTrajectoryData(well: WellNode, trajectoryData?: TrajectoryRows) {
        // Some trajectories missing data
        if (!trajectoryData || !trajectoryData.rows.length) {
            return this;
        }
        const trajectory = new WellTrajectory();
        const wellHead = well.wellHead;
        const curvePointRef = trajectoryData.rows[0].values;
        let md = wellHead.z - curvePointRef[0] * FTM;

        let prevPoint = new Vector3(
            curvePointRef[3] * FTM + wellHead.x,
            curvePointRef[4] * FTM + wellHead.y,
            wellHead.z - curvePointRef[0] * FTM);

        // Iterate through rows array
        for (const curvePointData of trajectoryData.rows) {
            const curvePoint = curvePointData.values;
            const point = new Vector3(
                curvePoint[3] * FTM + wellHead.x,
                curvePoint[4] * FTM + wellHead.y,
                wellHead.z - curvePoint[0] * FTM);
            md += prevPoint.distance(point);
            trajectory.add(new TrajectorySample(point, md));
            prevPoint = point;
        }
        this.wellTrajectoryNode.data = trajectory;
        return this;
    }

    // Add casings
    public addCasings() {
        const wellTrajectory = this.wellTrajectoryNode.data;
        if (!wellTrajectory) {
            return this;
        }
        // TODO - Implement this using wellTrajectoryData
        for (let idx = 0; idx < 5; idx++) {
            const mdRange = wellTrajectory.mdRange.clone();
            mdRange.expandByFraction(-0.05);
            const logNode = new CasingLogNode();
            logNode.data = FloatLog.createCasingByRandom(mdRange, 7);
            this.wellTrajectoryNode.addChild(logNode);
        }
        return this;
    }

    // Add float logs
    public addFloatLogs() {
        const wellTrajectory = this.wellTrajectoryNode.data;
        if (!wellTrajectory) {
            return this;
        }
        // TODO - Implement this using wellTrajectoryData
        for (let k = 0; k < 3; k++) {
            const mdRange = wellTrajectory.mdRange.clone();
            mdRange.min = (mdRange.center + mdRange.min) / 2;
            mdRange.expandByFraction(Random.getFloat2(-0.15, 0));
            const logNode = new FloatLogNode();
            const valueRange = new Range1(0, 3.14);
            logNode.data = FloatLog.createByRandom(mdRange, valueRange);
            this.wellTrajectoryNode.addChild(logNode);
        }
        return this;
    }

    // Add discrete logs
    public addDiscreteLogs() {
        const wellTrajectory = this.wellTrajectoryNode.data;
        if (!wellTrajectory) {
            return this;
        }
        // TODO - Implement this using wellTrajectoryData
        for (let k = 0; k < 4; k++) {
            const mdRange = wellTrajectory.mdRange.clone();
            mdRange.min = (mdRange.center + mdRange.min) / 2;
            mdRange.expandByFraction(Random.getFloat2(-0.25, 0));
            const logNode = new DiscreteLogNode();
            const valueRange = new Range1(0, 4);
            logNode.data = DiscreteLog.createByRandom(mdRange, valueRange);
            this.wellTrajectoryNode.addChild(logNode);
        }
        return this;
    }

    public getTrajectory(): WellTrajectoryNode {
        return this.wellTrajectoryNode;
    }
}
