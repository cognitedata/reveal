import * as utm from "utm";
import { WellNode } from "@/SubSurface/Wells/Nodes/WellNode";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { IWell } from "@cognite/subsurface-interfaces";
import { Util } from "@/Core/Primitives/Util";

export default class WellNodeCreator
{
  public static create(wellData: IWell | null): WellNode | null
  {
    if (!wellData)
      return null;

    const { metadata } = wellData;
    if (!metadata)
      return null;

    const x = Util.getNumber(metadata.x_coordinate); // CHECK: Which is Longitude or latitude
    const y = Util.getNumber(metadata.y_coordinate); // CHECK: Which is Longitude or latitude
    if (Number.isNaN(x) || Number.isNaN(y))
    {
      // tslint:disable-next-line:no-console
      console.warn("Well cannot have empty or invalid coordinates!", wellData.description);
      return null;
    }
    const xy = utm.fromLatLon(y, x);
    const wellNode = new WellNode();

    if (!Util.isEmpty(wellData.description))
      wellNode.name = wellData.description;

    wellNode.wellHead = new Vector3(xy.easting, xy.northing, 0);

    const waterDepth = Util.getNumberWithUnit(metadata.water_depth, metadata.water_depth_unit);
    if (!Number.isNaN(waterDepth))
      wellNode.waterDepth = waterDepth;

    return wellNode;
  }
}
