/**
 * Created by phil on 5/12/20
 */

/**
 * Overview
 * This is the interface for the Wellbore object
 */

export interface IWellboreMeta {
  type: string;
  active_indicator: string;
  asset_rig: string;
  asset_type: string;
  bh_x_coordinate: string;
  bh_y_coordinate: string;
  create_time: string;
  create_user: string;
  current_crs_name: string;
  elevation_type: string;
  elevation_value: string;
  elevation_value_unit: string;
  field_name: string;
  formation_total_depth: string;
  is_tight: string;
  parent_well_common_name: string;
  plugged_back_md: string;
  plugged_back_unit: string;
  total_depth_md: string;
  total_depth_unit: string;
  wellbore_concept_name: string;
  wellbore_lease_name: string;
  wellbore_legal_name: string;
  wellbore_purpose: string;
  wellbore_remark: string;
}

export interface IWellbore {
  externalId: string;
  name: string;
  parentId: number;
  parentExternalId: string;
  description: string;
  dataSetId: number;
  source: string;
  id: number;
  createdTime: string;
  lastUpdatedTime: string;
  rootId: number;
  metadata: IWellboreMeta;
}
