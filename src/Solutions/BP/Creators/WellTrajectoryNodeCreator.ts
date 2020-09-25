import { WellTrajectoryNode } from "@/SubSurface/Wells/Nodes/WellTrajectoryNode";
import { WellTrajectory } from "@/SubSurface/Wells/Logs/WellTrajectory";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { ITrajectoryColumnIndices, ITrajectoryRows } from "@cognite/node-visualizer-subsurface";
import { TrajectorySample } from "@/SubSurface/Wells/Samples/TrajectorySample";

export class WellTrajectoryNodeCreator
{
  public static create(trajectoryDataColumnIndices: ITrajectoryColumnIndices, trajectoryRows: ITrajectoryRows | null | undefined, startMd: number, unit: number): WellTrajectoryNode | null
  {
    const trajectory = WellTrajectoryNodeCreator.createTrajectory(trajectoryDataColumnIndices, trajectoryRows, startMd, unit);
    if (trajectory == null)
      return null; // Missing data

    const node = new WellTrajectoryNode();
    node.trajectory = trajectory;
    return node;
  }

  public static createTrajectory(trajectoryDataColumnIndices: ITrajectoryColumnIndices, trajectoryRows: ITrajectoryRows | null | undefined, startMd: number, unit: number): WellTrajectory | null
  {
    function getIndex(value?: number): number { return value === undefined ? -1 : value; }

    if (!trajectoryRows || !trajectoryRows.rows.length)
    {
      // If no rows at all
      // tslint:disable-next-line: no-console
      console.warn("NodeVisualizer: No trajectory available for well");
      return null;
    }
    const mdIndex = getIndex(trajectoryDataColumnIndices.md);
    const azimuthIndex = getIndex(trajectoryDataColumnIndices.azimuth);
    const inclinationIndex = getIndex(trajectoryDataColumnIndices.inclination);
    const tvdIndex = getIndex(trajectoryDataColumnIndices.tvd);
    const xOffsetIndex = getIndex(trajectoryDataColumnIndices.x_offset);
    const yOffsetIndex = getIndex(trajectoryDataColumnIndices.y_offset);

    const trajectory = new WellTrajectory();
    
    // If you have xOffset, yOffset, and Tvd (basically the same as x, y, z)
    if (xOffsetIndex >= 0 && yOffsetIndex >= 0 && tvdIndex >= 0)
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
        let z = curvePoint[tvdIndex];
        if (Number.isNaN(z))
          continue;
        let md = Number.NaN;
        if (mdIndex >= 0)
        {
          md = curvePoint[mdIndex];
          if (!Number.isNaN(md))
            md *= unit;
        }
        z *= unit;
        const sample = new TrajectorySample(new Vector3(x, y, startMd - z), Number.isNaN(md) ? z : md);
        if (azimuthIndex >= 0 && inclinationIndex >= 0)
        {
          sample.inclination = curvePoint[inclinationIndex];
          sample.azimuth = curvePoint[azimuthIndex];
        }
        const { length } = trajectory;
        if (length > 0 && Number.isNaN(md))
          sample.updateMdFromPrevSample(trajectory.getAt(length - 1));
        trajectory.add(sample);
      }
    }
    // Otherwise if you have md, azimuth, and inclination 
    else if (mdIndex >= 0 && azimuthIndex >= 0 && inclinationIndex >= 0)
    {
      for (const curvePointData of trajectoryRows.rows)
      {
        const curvePoint = curvePointData.values;
        let md = curvePoint[mdIndex];
        if (Number.isNaN(md))
          continue;
        const azimuth = curvePoint[azimuthIndex];
        if (Number.isNaN(azimuth))
          continue;
        const inclination = curvePoint[inclinationIndex];
        if (Number.isNaN(inclination))
          continue;
        md *= unit;
        const sample = new TrajectorySample(new Vector3(0, 0, startMd), md);
        sample.inclination = inclination;
        sample.azimuth = azimuth;
        const { length } = trajectory;
        if (length > 0 && !sample.updatePointFromPrevSample(trajectory.getAt(length - 1)))
          break;
        trajectory.add(sample);
      }
    }
    if (trajectory.length < 2)
      return null; // Missing data

    return trajectory;
  }
}
