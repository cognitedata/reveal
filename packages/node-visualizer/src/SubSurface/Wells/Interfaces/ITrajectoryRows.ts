/**
 * Created by phil on 5/12/20
 */

/**
 * Overview
 * This is the interface for the TrajectoryRows object
 */

// Note: the first TrajectoryColumns we will have will be
// { "name":"inclination" ,       "valueType":"DOUBLE"}
// { "name":"measuredDepth" ,     "valueType":"DOUBLE" }
// { "name":"trueVerticalDepth" , "valueType":"DOUBLE" }
// { "name":"eastOffset" ,        "valueType":"DOUBLE" }
// { "name":"northOffset" ,       "valueType":"DOUBLE" }

export interface ITrajectoryColumnR {
  name: string;
  externalId?: string;
  valueType: string; // DOUBLE | STRING | LONG
}

export interface ITrajectoryRow {
  rowNumber: number;
  values: number[];
}

export interface ITrajectoryColumnIndices {
  measuredDepth?: number;
  trueVerticalDepth?: number;
  azimuth?: number;
  inclination?: number;
  eastOffset?: number;
  northOffset?: number;
}

// note: the size of the TrajectoryRows "columns" array is identical to the size of the TrajectoryRow "values" array

export interface ITrajectoryRows {
  id: string;
  externalId: string;
  columns: ITrajectoryColumnR[];
  rows: ITrajectoryRow[];
}
