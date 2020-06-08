/**
 * Created by phil on 5/12/20
 */

/**
 * Overview
 * This is the interface for the Well object
 */

export interface WellMeta {
    "active_indicator": string,
    "basin_name": string,
    "country_name": string,
    "create_time": string,
    "create_user": string,
    "crs_epsg_orig": number,
    "crs_epsg_transform_orig": number,
    "current_crs_name": string,
    "current_operator": string,
    "on_off_shore": string,
    "operatorDiv": string,
    "spud_date": string,
    "state_name": string,
    "type": "Well",
    "water_depth": number,
    "water_depth_unit": string,
    "well_legal_name": string,
    "well_remark": string,
    "x_coordinate": number,
    "y_coordinate": number

}

export interface Well {
    "externalId": string,
    "name": string,
    "parentId": number,
    "parentExternalId": string,
    "description": string,
    "dataSetId": number,
    "source": string,
    "id": number,
    "createdTime": number,
    "lastUpdatedTime": number,
    "rootId": number
    "metadata": WellMeta,
}