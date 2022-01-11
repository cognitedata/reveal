import { ScannerDataElement } from '.';

export enum DataSetId {
  P66_EquipmentScans = 2527096956319199,
  PCMS = 5719472077867126,
  P66_ScarletScannerResults = 6047348858495410,
}

export enum DataElementOrigin {
  EQUIPMENT = 'equipment',
  COMPONENT = 'component',
}

export type EquipmentElementConfig = {
  label: string;
  type?: DataElementType;
  unit?: DataElementUnit | null;
  pcmsKey?: string;
};

export enum EquipmentElement {
  ALT_REGISTRATION_NO = 'alt_registration_no',
  ASSET_NO = 'asset_no',
  CLASS = 'class',
  COATING_SEQNO = 'coating_seqno',
  CODE_STAMP_YN = 'code_stamp_yn',
  CUI_POTENTIAL_YN = 'cui_potential_yn',
  EQUIP_TYPE_DESCRIPTION = 'equip_type_description',
  DESIGN_PRESSURE = 'design_pressure',
  DESIGN_TEMP = 'design_temp',
  ENVIRONMENT_SEQNO = 'environment_seqno',
  EQUIP_HEIGHT = 'equip_height',
  EQUIP_LENGTH = 'equip_length',
  EQUIP_ID = 'equip_id',
  EQUIP_TYPE = 'equip_type',
  EQUIP_WIDTH = 'equip_width',
  FIREPROOFING_YN = 'fireproofing_yn',
  FULL_VACUUM_YN = 'full_vacuum_yn',
  GOVERNING_CODE = 'governing_code',
  HF_ACID_SERVICE_SEQNO = 'hf_acid_service_seqno',
  HEAT_TRACING_YN = 'heat_tracing_yn',
  IN_SERVICE_DT = 'in_service_dt',
  INSTALL_DT = 'install_dt',
  INSULATION_TYPE_SEQNO = 'insulation_type_seqno',
  MATERIAL = 'material',
  MAX_ALLOW_WRK_PRES = 'max_allow_wrk_pres',
  MAX_ALLOW_WRK_TEMP = 'max_allow_wrk_temp',
  MDM_TEMP = 'mdm_temp',
  OPERATING_PRESSURE = 'operating_pressure',
  OPERATING_STATUS = 'operating_status',
  OPERATING_TEMP = 'operating_temp',
  ORIENTATION = 'orientation',
  OUTER_DIAMETER = 'outer_diameter',
  MANUFACTURER = 'manufacturer',
  P_ID_DRAWING_NO = 'p_id_drawing_no',
  PROCESS_IMPACT_SEQNO = 'process_impact_seqno',
  PWHT_YN = 'pwht_yn',
  REGISTRATION_NO = 'registration_no',
  RERATED_YN = 'rerated_yn',
  SERVICE = 'service',
  SYSTEM = 'system',
  U1_ON_FILE_YN = 'u1_on_file_yn',
  UNIT = 'unit',
}

export enum DataElementType {
  STRING = 'string',
  INT = 'int',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  ORIENTATION = 'vertical,horizontal',
  DATE = 'date',
}

export enum DataElementUnit {
  PSI = 'psi',
  FAHRENHEIT = 'F',
  FEET = 'ft',
}

export type DataElementProps = EquipmentElementConfig &
  ScannerDataElement & { scannerKey: EquipmentElement | string };
