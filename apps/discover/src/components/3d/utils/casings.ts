import {
  CasingAssemblyInternal,
  CasingSchematicInternal,
} from 'domain/wells/casings/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import keyBy from 'lodash/keyBy';

import { ICasing } from '@cognite/node-visualizer';

export const mapCasingsTo3D = (
  wellbores: WellboreInternal[],
  casingSchematics: CasingSchematicInternal[]
) => {
  const keyedWellbores = keyBy(wellbores, 'matchingId');
  return casingSchematics.flatMap((casingSchematic) =>
    casingSchematic.casingAssemblies.map((casingAssembly) =>
      mapCasingTo3D(
        casingSchematic,
        casingAssembly,
        keyedWellbores[casingSchematic.wellboreMatchingId]
      )
    )
  );
};

/**
 * We are not getting any data from the backend for some fields that were came as metadata in the old SDK.
 * Also, those fields have not been used in the node-visualizer package. That's why I made them empty.
 * So, those fields have been set to empty below.
 * This would be cleaned up later by changing the types.
 */
export const mapCasingTo3D = (
  casingSchematic: CasingSchematicInternal,
  casingAssembly: CasingAssemblyInternal,
  wellbore?: WellboreInternal
): Partial<ICasing> => {
  return {
    // ...casing,
    id: casingSchematic.wellboreMatchingId,
    assetId: casingSchematic.wellboreAssetExternalId,
    externalId: casingSchematic.source.sequenceExternalId,
    name: casingSchematic.source.sourceName,
    description: '',
    columns: [],
    createdTime: '',
    lastUpdatedTime: '',
    metadata: {
      assy_min_inside_diameter: String(casingAssembly.minInsideDiameter.value),
      policy_id: '',
      assy_design_native_uid: '',
      assy_date_in_hole: '',
      source: casingSchematic.source.sourceName, // "EDM"
      assy_sequence_no: '', // "2"
      type: casingAssembly.type || '', // "Casing"
      assy_report_desc: casingAssembly.reportDescription || '', // "22\" CASING REPORT"
      assy_date_landed: '', // "1174780800000000000"
      wellboreName: wellbore?.name || '', // "OCS-G 09981 /GC825-11 (SP3) ST00BP00"
      assy_current_status_date: '', // "1553126400000000000"
      assy_comments: '', // "Expandable casing expands from 8 5/8\" to 9.427\" with a 8.66 drift.  Expandable casing moved up the hole 126' during expansion process.  Possibility that casing was lifted during expansion process.  The incident was  investigated by Enventure.Expandable Connections = XPC left hand.",
      assy_original_md_base: String(casingAssembly.measuredDepthBase.value), // "7833.015666"
      assy_current_status_reason: '', // "ORIGINAL INSTALL"
      object_state: '', // "ACTUAL"
      assy_current_status_comment: '', // "Tubing removed so casing can be cut and new Geological target acquired."
      assy_current_md_top: '', // "18566.037132"
      assy_hole_size: '', // "26.0"
      assy_event_native_uid: '', // "Yix8V"
      assy_report_type: '', // "CASING"
      assy_original_md_top: String(casingAssembly.measuredDepthTop.value), // "4946.009892"
      assy_design_existance_kind: '', // ""
      assy_size: String(casingAssembly.minOutsideDiameter.value) || '', // "22.0"
      assy_current_md_base: '', // "18568.59713712"
      datasetName: '', // "BP-EDM-casing"
      assy_current_status_desc: '', // "INSTALLED"
      assy_report_date: '', // "1553126400000000000"
      assy_type: '', // "Casing"
      assy_native_uid: '', // "IS4mn"
      assy_report_native_uid: '', // "r6LksbIVcd"
      parentExternalId: casingSchematic.wellboreAssetExternalId, // "USA0000651100"
      assy_cement_jobs_native_uid: '', // "IRyqw"
      assy_name: casingAssembly.type || '', // "SURFACE CASING"
      assy_design_name: '', // "7886"
    },
  };
};
