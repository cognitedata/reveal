/**
 * Created by phil on 5/12/20
 */

/**
 * Overview
 * This is the interface for the Well object
 */
export type WellId = number;

export interface IWellMeta {
  active_indicator: string;
  basin_name: string;
  country_name: string;
  create_time: string;
  create_user: string;
  crs_epsg_orig: number | string;
  crs_epsg_transform_orig: number | string;
  current_crs_name: string;
  current_operator: string;
  on_off_shore: string;
  operatorDiv: string;
  spud_date: string;
  state_name: string;
  type: string;
  water_depth: string;
  water_depth_unit: string;
  well_legal_name: string;
  well_remark: string;
  x_coordinate: string;
  y_coordinate: string;
}

export interface IWell {
  externalId: string;
  name: string;
  parentId: number;
  parentExternalId: string;
  description: string;
  dataSetId: number;
  source: string;
  id: WellId;
  createdTime: string;
  lastUpdatedTime: string;
  rootId: number;
  metadata: IWellMeta;
}
