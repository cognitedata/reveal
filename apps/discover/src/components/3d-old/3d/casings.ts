import { ICasing } from '@cognite/node-visualizer';
import { Sequence } from '@cognite/sdk';
// import { CasingSchematic } from '@cognite/sdk-wells-v3';

export const mapCasingsTo3D = (casings: Sequence[]) =>
  casings.map(mapCasingTo3D);

export const mapCasingTo3D = (casing: Sequence): Partial<ICasing> => {
  return {
    ...casing,
    id: String(casing.id) || '',
    assetId: String(casing.assetId) || '',
    externalId: String(casing.externalId) || '',
    name: casing.name || '',
    description: casing.description || '',
    columns: [],
    createdTime: '',
    lastUpdatedTime: '',
    metadata: {
      assy_min_inside_diameter: casing.metadata?.assy_min_inside_diameter || '',
      policy_id: casing.metadata?.policy_id || '',
      assy_design_native_uid: casing.metadata?.assy_design_native_uid || '',
      assy_date_in_hole: casing.metadata?.assy_date_in_hole || '',
      source: casing.metadata?.source || '', // "EDM"
      assy_sequence_no: casing.metadata?.assy_sequence_no || '', // "2"
      type: casing.metadata?.type || '', // "Casing"
      assy_report_desc: casing.metadata?.assy_report_desc || '', // "22\" CASING REPORT"
      assy_date_landed: casing.metadata?.assy_date_landed || '', // "1174780800000000000"
      wellboreName: casing.metadata?.wellboreName || '', // "OCS-G 09981 /GC825-11 (SP3) ST00BP00"
      assy_current_status_date: casing.metadata?.assy_current_status_date || '', // "1553126400000000000"
      assy_comments: casing.metadata?.assy_comments || '', // "Expandable casing expands from 8 5/8\" to 9.427\" with a 8.66 drift.  Expandable casing moved up the hole 126' during expansion process.  Possibility that casing was lifted during expansion process.  The incident was  investigated by Enventure.Expandable Connections = XPC left hand.",
      assy_original_md_base: casing.metadata?.assy_original_md_base || '', // "7833.015666"
      assy_current_status_reason:
        casing.metadata?.assy_current_status_reason || '', // "ORIGINAL INSTALL"
      object_state: casing.metadata?.object_state || '', // "ACTUAL"
      assy_current_status_comment:
        casing.metadata?.assy_current_status_comment || '', // "Tubing removed so casing can be cut and new Geological target acquired."
      assy_current_md_top: casing.metadata?.assy_current_md_top || '', // "18566.037132"
      assy_hole_size: casing.metadata?.assy_hole_size || '', // "26.0"
      assy_event_native_uid: casing.metadata?.assy_event_native_uid || '', // "Yix8V"
      assy_report_type: casing.metadata?.assy_report_type || '', // "CASING"
      assy_original_md_top: casing.metadata?.assy_original_md_top || '', // "4946.009892"
      assy_design_existance_kind:
        casing.metadata?.assy_design_existance_kind || '', // ""
      assy_size: casing.metadata?.assy_size || '', // "22.0"
      assy_current_md_base: casing.metadata?.assy_current_md_base || '', // "18568.59713712"
      datasetName: casing.metadata?.datasetName || '', // "BP-EDM-casing"
      assy_current_status_desc: casing.metadata?.assy_current_status_desc || '', // "INSTALLED"
      assy_report_date: casing.metadata?.assy_report_date || '', // "1553126400000000000"
      assy_type: casing.metadata?.assy_type || '', // "Casing"
      assy_native_uid: casing.metadata?.assy_native_uid || '', // "IS4mn"
      assy_report_native_uid: casing.metadata?.assy_report_native_uid || '', // "r6LksbIVcd"
      parentExternalId: casing.metadata?.parentExternalId || '', // "USA0000651100"
      assy_cement_jobs_native_uid:
        casing.metadata?.assy_cement_jobs_native_uid || '', // "IRyqw"
      assy_name: casing.metadata?.assy_name || '', // "SURFACE CASING"
      assy_design_name: casing.metadata?.assy_design_name || '', // "7886"
    },
  };
};
