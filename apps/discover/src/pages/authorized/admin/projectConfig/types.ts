import { FC, PropsWithChildren } from 'react';

import { Metadata } from '../../../../domain/projectConfig/types';

export type PrimitiveValue = string | number | boolean;

export type Config = {
  [key: string]:
    | PrimitiveValue
    | Config
    | PrimitiveValue[]
    | Config[]
    | undefined;
};

// todo(PP-2934): remove this and use Config
type ConfigValues = { [index: string | number]: unknown } | [];

export type MetadataKey = keyof Metadata;

export type MetadataValue = Metadata[keyof Metadata];

export type HandleConfigChange = (key: string, value: unknown) => void;

export type HandleConfigUpdate = () => void;

export type HandleConfigDelete = (key: string, value: unknown) => void;

export type CustomComponentProps = {
  onClose: () => void;
  onChangeAndUpdate: HandleConfigChange;
  values?: ConfigValues;
  type: string;
  valuePath: string;
  metadataValue?: MetadataValue;
  value?: unknown;
  mode: 'EDIT' | 'NEW';
};

export type CustomDeleteProps = {
  onClose: () => void;
  onDelete: () => void;
  type: string;
  label?: string;
  id?: string;
  featureTypeId?: string;
};

export type ConfigFormProps = {
  metadataValue?: MetadataValue;
  onChange: HandleConfigChange;
  onUpdate: HandleConfigUpdate;
  onChangeAndUpdate: HandleConfigChange;
  valuePath: string;
  metadataPath: string;
  values?: ConfigValues;
  renderCustomComponent: FC<PropsWithChildren<CustomComponentProps>>;
  renderDeleteComponent: FC<PropsWithChildren<CustomDeleteProps>>;
  hasChanges: boolean;
};

export type RightPanelProps = ConfigFormProps & {
  onReset: () => void;
};
