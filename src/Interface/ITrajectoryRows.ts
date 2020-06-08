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

export interface TrajectoryColumnR {
    "name":string,
    "externalId":string,
    "valueType": string, // DOUBLE | STRING | LONG
}

export interface TrajectoryRow {
    "rowNumber": number,
    "values": [number]
}

// note: the size of the TrajectoryRows "columns" array is identical to the size of the TrajectoryRow "values" array

export interface TrajectoryRows {
    "id": number,
    "externalId": string,
    "columns": [TrajectoryColumnR],
    "rows": [TrajectoryRow]
}