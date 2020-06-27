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
import { TrajectoryRows, RiskEvent } from "@/Interface";
import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";
import { FEAT_TO_METER } from "@/Solutions/BP/Constants";
import { PointLog } from "@/Nodes/Wells/Logs/PointLog";
import { PointLogSample } from "@/Nodes/Wells/Samples/PointLogSample";
import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";

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
    public setTrajectoryData(well: WellNode, dataIndexes: number[], trajectoryData?: TrajectoryRows) {
        // Some trajectories missing data
        if (!trajectoryData || !trajectoryData.rows.length) {
            // tslint:disable-next-line: no-console
            console.log("NodeVisualizer: No curve points available for", this.wellTrajectoryNode.getName());
            return this;
        }
        const trajectory = new WellTrajectory();
        const wellHead = well.wellHead;
        const [mdIndex, xOffsetIndex, yOffsetIndex] = dataIndexes;
        const curvePointRef = trajectoryData.rows[0].values;
        let md = wellHead.z - curvePointRef[mdIndex] * FEAT_TO_METER;

        let prevPoint = new Vector3(
            curvePointRef[xOffsetIndex] * FEAT_TO_METER + wellHead.x,
            curvePointRef[yOffsetIndex] * FEAT_TO_METER + wellHead.y,
            md);

        // Iterate through rows array
        for (const curvePointData of trajectoryData.rows) {
            const curvePoint = curvePointData.values;
            const point = new Vector3(
                curvePoint[xOffsetIndex] * FEAT_TO_METER + wellHead.x,
                curvePoint[yOffsetIndex] * FEAT_TO_METER + wellHead.y,
                wellHead.z - curvePoint[mdIndex] * FEAT_TO_METER);
            md += prevPoint.distance(point);
            trajectory.add(new TrajectorySample(point, md));
            prevPoint = point;
        }
        this.wellTrajectoryNode.data = trajectory;
        return this;
    }

    // Add NPT events
    public addNPTEvents(nptEvents?: RiskEvent[]) {
        if (!nptEvents) {
            return this;
        }
        const wellTrajectory = this.wellTrajectoryNode.data;
        if (!wellTrajectory) {
            return this;
        }
        // tslint:disable-next-line: no-console
        console.log("NodeVisualizer: Adding NPT events", nptEvents.length);
        const pointLog = new PointLog();
        for (const nptEvent of nptEvents) {
            const md = parseFloat(nptEvent.metadata.md_hole_start) * FEAT_TO_METER;
            const pointLogSample = new PointLogSample(nptEvent.description, md);
            pointLog.samples.push(pointLogSample);
        }
        pointLog.sortByMd();
        const poinitLogNode = new PointLogNode();
        poinitLogNode.data = pointLog;
        this.wellTrajectoryNode.addChild(poinitLogNode);
        return this;
    }

    // Add NDS events
    public addNDSEvents(ndsEvents?: RiskEvent[]) {
        if (!ndsEvents) {
            return this;
        }
        const wellTrajectory = this.wellTrajectoryNode.data;
        if (!wellTrajectory) {
            return this;
        }
        // tslint:disable-next-line: no-console
        console.log("NodeVisualizer: Adding NDS events", ndsEvents.length);
        const pointLog = new PointLog();
        for (const ndsEvent of ndsEvents) {
            const md = parseFloat(ndsEvent.metadata.md_hole_start) * FEAT_TO_METER;
            const pointLogSample = new PointLogSample(ndsEvent.description, md);
            pointLog.samples.push(pointLogSample);
        }
        pointLog.sortByMd();
        const poinitLogNode = new PointLogNode();
        poinitLogNode.data = pointLog;
        this.wellTrajectoryNode.addChild(poinitLogNode);
        return this;
    }

    // Add casings
    public addCasings() {
        const wellTrajectory = this.wellTrajectoryNode.data;
        if (!wellTrajectory) {
            return this;
        }
        // TODO - Implement this using wellTrajectoryData
        for (let idx = 0; idx < 1; idx++) {
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
