import { FeatureCollection } from 'geojson';

import { CustomComponentProps } from '../projectConfig';

export type LayerFormValues = {
  id: string;
  name: string;
  featureTypeId: string;
  layerSource: FeatureCollection;
  disabled?: boolean;
  [index: string]: unknown;
};

export type FormModalProps = Pick<
  CustomComponentProps,
  'onClose' | 'metadataValue' | 'value' | 'mode'
> & {
  onOk: (datum: Record<string, unknown>) => void;
};
