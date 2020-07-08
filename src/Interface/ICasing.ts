export interface ICasingMetadata {
  assy_min_inside_diameter: string;
  policy_id: string;
  assy_design_native_uid: string;
  assy_date_in_hole: string;
  source: string; // "EDM"
  assy_sequence_no: string //"2"
  type: string //"Casing"
  assy_report_desc: string; //"22\" CASING REPORT"
  assy_date_landed: string; //"1174780800000000000"
  wellboreName: string; //"OCS-G 09981 /GC825-11 (SP3) ST00BP00"
  assy_current_status_date: string; //"1553126400000000000"
  assy_comments: string; //"Expandable casing expands from 8 5/8\" to 9.427\" with a 8.66 drift.  Expandable casing moved up the hole 126' during expansion process.  Possibility that casing was lifted during expansion process.  The incident was  investigated by Enventure.Expandable Connections = XPC left hand.",
  assy_original_md_base: string; //"7833.015666"
  assy_current_status_reason: string; //"ORIGINAL INSTALL"
  object_state: string; //"ACTUAL"
  assy_current_status_comment: string; //"Tubing removed so casing can be cut and new Geological target acquired."
  assy_current_md_top: string; //"18566.037132"
  assy_hole_size: string; //"26.0"
  assy_event_native_uid: string; //"Yix8V"
  assy_report_type: string; //"CASING"
  assy_original_md_top: string; //"4946.009892"
  assy_design_existance_kind: string; //""
  assy_size: string; //"22.0"
  assy_current_md_base: string; //"18568.59713712"
  datasetName: string; //"BP-EDM-casing"
  assy_current_status_desc: string; //"INSTALLED"
  assy_report_date: string; //"1553126400000000000"
  assy_type: string; //"Casing"
  assy_native_uid: string; //"IS4mn"
  assy_report_native_uid: string; //"r6LksbIVcd"
  parentExternalId: string; //"USA0000651100"
  assy_cement_jobs_native_uid: string; //"IRyqw"
  assy_name: string; //"SURFACE CASING"
  assy_design_name: string //"7886"
}

export interface ICasingColumns {
  name: string;
  externalId: string;
  valueType: "DOUBLE" | "STRING";
  metadata: { unit?: "in" | "ft" | "ppf" }
}

export interface ICasing {
  id: number;
  name: string;
  description: string;
  assetId: number;
  externalId: string;
  metadata: ICasingMetadata;
  columns: ICasingColumns[];
  createdTime: string;
  lastUpdatedTime: string;
  dataSetId: number;
}