/**
 * Interface for the Risk object at BP
 */

export interface IRiskMetadata {
  archived: string;
  contingency: string;
  country: string;
  details: string;
  diameter_hole_unit: string;
  duration_unit: string;
  end_well_top: string;
  field_name: string;
  formation: string;
  further_analysis: string;
  geological_period: string;
  hidden: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  lithology: string;
  md_hole_end: string;
  md_hole_end_unit: string;
  md_hole_start: string;
  md_hole_start_unit: string;
  name: string;
  operation: string;
  parentExternalId: string;
  probability: string;
  region: string;
  risk_sub_category: string;
  root_cause: string;
  root_cause_details: string;
  severity: string;
  start_well_top: string;
  summary: string;
  tvd_offset_hole_end_unit: string;
  tvd_offset_hole_start_unit: string;
  type: string;
  well_name: string;
}

export interface IRiskEvent {
  externalId: string;
  dataSetId: number;
  startTime: number;
  endTime: number;
  subtype: string;
  description: string;
  metadata: IRiskMetadata;
  assetIds: number[];
  source: string;
  id: number;
  lastUpdatedTime: string;
  createdTime: string;
}
