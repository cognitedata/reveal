import { FeatureCollection } from 'geojson';

export type LayerFormValues = {
  id: string;
  name: string;
  featureTypeId: string;
  layerSource: FeatureCollection;
  disabled?: boolean;
  [index: string]: unknown;
};

export type OnSuccess = (datum: Record<string, unknown>) => void;
