import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { ITrajectoryRows } from "@/Interface";
import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";
import { Units } from "@/Core/Primitives/Units";
import { Ma } from "@/Core/Primitives/Ma";

export default class WellTrajectoryNodeCreator
{
    public static create(trajectoryDataColumnIndexes: { [key: string]: number }, trajectoryRows: ITrajectoryRows | null | undefined): WellTrajectoryNode | null
    {
        // Some trajectories missing data
        if (!trajectoryRows || !trajectoryRows.rows.length)
        {
            // tslint:disable-next-line: no-console
            console.warn("NodeVisualizer: No curve points available");
            return null;
        }
        // The values are
        //inclination
        //md
        //tvd
        //x_offset
        //y_offset
        const mdIndex = trajectoryDataColumnIndexes["md"]
        const azimuthIndex = trajectoryDataColumnIndexes["azimuth "]
        const inclinationIndex = trajectoryDataColumnIndexes["inclination"]
        const tvdIndex = trajectoryDataColumnIndexes["tvd"]
        const xOffsetIndex = trajectoryDataColumnIndexes["x_offset"]
        const yOffsetIndex = trajectoryDataColumnIndexes["y_offset"]

        // Iterate through rows array
        const trajectory = new WellTrajectory();
        for (const curvePointData of trajectoryRows.rows)
        {
            const curvePoint = curvePointData.values;
            let z = curvePoint[mdIndex]; // Assume md is same as z
            const azimuth = curvePoint[azimuthIndex];
            const inclination = curvePoint[inclinationIndex];
            const x = curvePoint[xOffsetIndex];
            const y = curvePoint[yOffsetIndex];

            if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z))
            {
                // tslint:disable-next-line:no-console
                console.warn("Trajectory Curve point reference is not a valid number!", trajectoryRows);
                return null;
            }
            const point = new Vector3(x, y, -z);
            point.z *= Units.Feet; // CHECK? Is this correct

            const length = trajectory.length;
            let sample: TrajectorySample;
            if (length == 0)
                sample = new TrajectorySample(point, Math.abs(point.z));
            else
            {
                const prevSample = trajectory.getAt(length - 1);
                const md = prevSample.md + prevSample.point.distance(point);
                sample = new TrajectorySample(point, md);
            }
            sample.inclination = inclination;
            sample.azimuth = azimuth;
            trajectory.add(sample);
        }

        // Dodo implement by the azimuth and inclination
        // dMD = Distance2 - Distance1
        // B = acos(cos(I2 - I1) - (sin(I1)*sin(I2)*(1-cos(A2-A1))))
        // RF = 2 / B * tan(B / 2)
        // dX = dMD/2 * (sin(I1)*sin(A1) + sin(I2)*sin(A2))*RF
        // dY = dMD/2 * (sin(I1)*cos(A1) + sin(I2)*cos(A2))*RF
        // dZ = dMD/2 * (cos(I1) + cos(I2))*RF
        
        // X2 = X1 + dX
        // Y2 = Y1 + dX
        // Z2 = Z1 + dX

        const node = new WellTrajectoryNode();
        node.data = trajectory;
        return node;
    }
}
