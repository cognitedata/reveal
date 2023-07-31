import { DISCOVER_FEATURE_TYPE_PREFIX } from 'domain/geospatial/constants';
import { LayerFormValues } from 'domain/geospatial/internal/types';

export const validate = (values: LayerFormValues) => {
  const errors: Record<string, string> = {};
  if (!values.id) {
    errors.id = 'Please enter a valid Id';
  }
  if (!values.name) {
    errors.name = 'Please enter a valid Name';
  }
  if (values.layerSource && values.featureTypeId) {
    errors.layerSource =
      'You can only choose existing feature type or select a source file.';
  }
  if (!(values.layerSource || values.featureTypeId)) {
    errors.layerSource =
      'Please select a source file or choose existing feature type';
  }
  return errors;
};

export const getNewFeatureTypeId = (): string => {
  return `${DISCOVER_FEATURE_TYPE_PREFIX}${String(Date.now())}_${String(
    Math.random()
  ).slice(2, 7)}`;
};
