import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { ITrajectoryRows } from "@/Interface";
import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";
import { Units } from "@/Core/Primitives/Units";
import { Ma } from "@/Core/Primitives/Ma";

export default class WellTrajectoryNodeCreator
{
    public static create(trajectoryDataColumnIndexes: { [key: string]: number }, trajectoryRows: ITrajectoryRows | null | undefined, elevation: number, unit: number): WellTrajectoryNode | null
    {
        // Some trajectories missing data
        if (!trajectoryRows || !trajectoryRows.rows.length)
        {
            // tslint:disable-next-line: no-console
            console.warn("NodeVisualizer: No trajectory available for well");
            return null;
        }
        const mdIndex = trajectoryDataColumnIndexes["md"];
        const azimuthIndex = trajectoryDataColumnIndexes["azimuth"];
        const inclinationIndex = trajectoryDataColumnIndexes["inclination"];
        const tvdIndex = trajectoryDataColumnIndexes["tvd"];
        const xOffsetIndex = trajectoryDataColumnIndexes["x_offset"];
        const yOffsetIndex = trajectoryDataColumnIndexes["y_offset"];

        const trajectory = new WellTrajectory();

        console.log("======================");
        if (mdIndex >= 0 && azimuthIndex >= 0 && inclinationIndex >= 0)
        {
            for (const curvePointData of trajectoryRows.rows)
            {
                const curvePoint = curvePointData.values;
                let md = curvePoint[mdIndex]; // Assume md is same as z
                if (Number.isNaN(md))
                    continue;

                const azimuth = curvePoint[azimuthIndex];
                if (Number.isNaN(azimuth))
                    continue;

                const inclination = curvePoint[inclinationIndex];
                if (Number.isNaN(inclination))
                    continue;

                md *= unit;

                const sample = new TrajectorySample(new Vector3(0, 0, elevation), md);
                sample.inclination = inclination;
                sample.azimuth = azimuth;

                const length = trajectory.length;
                if (length > 0 && !sample.updatePointFromPrevSample(trajectory.getAt(length - 1)))
                    break;

                trajectory.add(sample);
                console.log(sample.point.toString());
            }
        }
        // Iterate through rows array
        else if (xOffsetIndex >= 0 && yOffsetIndex >= 0 && tvdIndex >= 0)
        {
            for (const curvePointData of trajectoryRows.rows)
            {
                const curvePoint = curvePointData.values;
                const x = curvePoint[xOffsetIndex];
                if (Number.isNaN(x))
                    continue;

                const y = curvePoint[yOffsetIndex];
                if (Number.isNaN(y))
                    continue;

                let z = curvePoint[tvdIndex]; // Assume md is same as z
                if (Number.isNaN(z))
                    continue;

                let md = Number.NaN;
                if (mdIndex >= 0)
                {
                    md = curvePoint[mdIndex]; // Assume md is same as z
                    if (!Number.isNaN(md))
                        md *= unit;
                }
                z = z * unit;

                const sample = new TrajectorySample(new Vector3(x, y, elevation - z), Number.isNaN(md) ? z : md);
                sample.inclination = curvePoint[inclinationIndex];
                sample.azimuth = curvePoint[azimuthIndex];

                const length = trajectory.length;
                if (length > 0 && Number.isNaN(md))
                    sample.updateMdFromPrevSample(trajectory.getAt(length - 1));

                trajectory.add(sample);
            }
        }

        if (trajectory.length < 2)
            return null;

        const node = new WellTrajectoryNode();
        node.data = trajectory;
        return node;
    }
}
