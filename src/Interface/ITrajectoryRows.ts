/**
 * Created by phil on 5/12/20
 */

/**
 * Overview
 * This is the interface for the TrajectoryRows object
 */

// Note: the first TrajectoryColumns we will have will be
// { "name":"inclination" , "valueType":"DOUBLE"}
// { "name":"md" ,          "valueType":"DOUBLE" }
// { "name":"tvd" ,         "valueType":"DOUBLE" }
// { "name":"x_offset" ,    "valueType":"DOUBLE" }
// { "name":"y_offset" ,    "valueType":"DOUBLE" }

export interface ITrajectoryColumnR {
  name: string;
  externalId?: string;
  valueType: string; // DOUBLE | STRING | LONG
}

export interface ITrajectoryRow {
  rowNumber: number;
  values: number[];
}

export interface ITrajectoryColumnIndices
{
  md?: number;
  tvd?: number;
  azimuth?: number;
  inclination?: number;
  x_offset?: number;
  y_offset?: number;
}

// note: the size of the TrajectoryRows "columns" array is identical to the size of the TrajectoryRow "values" array

export interface ITrajectoryRows {
  id: number;
  externalId: string;
  columns: ITrajectoryColumnR[];
  rows: ITrajectoryRow[];
}
