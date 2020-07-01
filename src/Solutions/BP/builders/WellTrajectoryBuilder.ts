import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { Range1 } from "@/Core/Geometry/Range1";
import { Random } from "@/Core/Primitives/Random";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { DiscreteLog } from "@/Nodes/Wells/Logs/DiscreteLog";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Trajectory, TrajectoryRows, RiskEvent, ILog } from "@/Interface";
import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";
import { PointLog } from "@/Nodes/Wells/Logs/PointLog";
import { PointLogSample } from "@/Nodes/Wells/Samples/PointLogSample";
import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";
import { Units } from "@/Core/Primitives/Units";
import { LogFolder } from "@/Nodes/Wells/Wells/LogFolder";

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
            console.error("NodeVisualizer: No curve points available for", this.wellTrajectoryNode.getName());
            return this;
        }
        const trajectory = new WellTrajectory();
        const wellHead = well.wellHead;
        const [mdIndex, xOffsetIndex, yOffsetIndex] = dataIndexes;
        const curvePointRef = trajectoryData.rows[0].values;
        let md = wellHead.z - curvePointRef[mdIndex] * Units.Feet;

        let prevPoint = new Vector3(
            curvePointRef[xOffsetIndex] * Units.Feet + wellHead.x,
            curvePointRef[yOffsetIndex] * Units.Feet + wellHead.y,
            md);

        // Iterate through rows array
        for (const curvePointData of trajectoryData.rows) {
            const curvePoint = curvePointData.values;
            const point = new Vector3(
                curvePoint[xOffsetIndex] * Units.Feet + wellHead.x,
                curvePoint[yOffsetIndex] * Units.Feet + wellHead.y,
                wellHead.z - curvePoint[mdIndex] * Units.Feet);
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
            const md = parseFloat(nptEvent.metadata.md_hole_start) * Units.Feet;
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
            const md = parseFloat(ndsEvent.metadata.md_hole_start) * Units.Feet;
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

    // Add Logs
    public addLogs(logs?: ILog[]) { // here are the logs related to the current trajectory from NodeAdaptor
        const wellTrajectory = this.wellTrajectoryNode.data;
        if (!logs || !wellTrajectory) {
            return this;
        }

        for (let logIndex = 0; logIndex < logs.length; logIndex++) {
            const logFolder = new LogFolder();
            this.wellTrajectoryNode.addChild(logFolder);
            const items = logs[logIndex].items;
            if (items.length === 0) {
                continue;
            }

            let mdIndex: number = -1;
            const logTypeIndexes: number[] = [];
            items[0].columns.forEach((column, index) => {
                if (column.externalId === "DEPT") {
                    mdIndex = index;
                }
                else {
                    logTypeIndexes.push(index)
                }
            });

            // if there is no DEPT colomn or no any log colomns
            if (mdIndex == -1 || logTypeIndexes.length === 0) {
                continue;
            }

            logTypeIndexes.forEach(index => {
                const floatLogNode = new FloatLogNode();
                logFolder.addChild(floatLogNode);

                floatLogNode.data = FloatLog.createFloatLog(items, mdIndex, index);

                // geting the name from first item
                const name = items[0].columns[index].name;
                if (name) {
                    floatLogNode.setName(name);
                }
            });
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
