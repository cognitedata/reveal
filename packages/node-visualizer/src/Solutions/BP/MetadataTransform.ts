const wellboreMetadata = {
  elevation_type: 'elevation_type',
  elevation_value: 'elevation_value',
  elevation_value_unit: 'elevation_value_unit',
  bh_x_coordinate: 'bh_x_coordinate',
  bh_y_coordinate: 'bh_y_coordinate',
};

const wellMetadata = {
  x_coordinate: 'x_coordinate',
  y_coordinate: 'y_coordinate',
  water_depth: 'water_depth',
  water_depth_unit: 'water_depth_unit',
};

const casingMetadata = {
  assy_name: 'assy_name',
  assy_comments: 'assy_comments',
  assy_hole_size: 'assy_hole_size',
  assy_original_md_top: 'assy_original_md_top',
  assy_original_md_base: 'assy_original_md_base',
  assy_current_status_comment: 'assy_current_status_comment',
};

const metadataValidationMap = {
  well: validateWellMetadata,
  wellbore: validateWellboreMetadata,
  casing: validateCasingMetadata,
};

type ValidationMetadataTypes = keyof typeof metadataValidationMap;
type WellMetadataKeys = keyof typeof wellMetadata;
type WellboreMetadataKeys = keyof typeof wellboreMetadata;

export type WellboreMetadata = {
  [key in WellboreMetadataKeys]: string;
};

export type WellMetadata = {
  [key in WellMetadataKeys]: string;
};

export type MetadataKeyMapping<T> = {
  [K in keyof T]?: string;
};

export interface Metadata {
  [key: string]: string;
}

export function mapMetadataKeys<T extends Metadata>(
  mapping: MetadataKeyMapping<T>,
  data: Metadata
): T {
  const mappedData = Object.keys(mapping).reduce((result, key) => {
    const mappedKey = mapping[key];

    if (mappedKey) {
      return {
        ...result,
        [key]: data[mappedKey],
      };
    }

    return result;
  }, {});

  return { ...data, ...mappedData } as T;
}

export function validateMetadata(
  data: Metadata,
  type: ValidationMetadataTypes
): boolean {
  return metadataValidationMap[type](data);
}

function validateWellboreMetadata(data: Metadata): boolean {
  return Object.keys(wellboreMetadata).every(
    (key: string) => data[key] !== undefined
  );
}

function validateCasingMetadata(data: Metadata): boolean {
  return Object.keys(casingMetadata).every(
    (key: string) => data[key] !== undefined
  );
}

function validateWellMetadata(data: Metadata): boolean {
  return Object.keys(wellMetadata).every((key: string) => data[key]);
}
