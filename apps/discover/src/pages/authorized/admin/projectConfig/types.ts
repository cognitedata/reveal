import { ProjectConfig } from '@cognite/discover-api-types';

export type PrimitiveValue = string | number | boolean;

export type Config = {
  [key: string]:
    | PrimitiveValue
    | Config
    | PrimitiveValue[]
    | Config[]
    | undefined;
};

export type Metadata = {
  [key: string]: {
    children?: Metadata;
    dataAsChildren?: boolean;
    enums?: string[];
    helpText?: string;
    label: string;
    placeholder?: string;
    type?: 'boolean' | 'string' | 'number' | 'object' | 'array';
    renderAsJSON?: boolean;
    dataLabelIdentifier?: string;
  };
};

export type MetadataKey = keyof Metadata;

export type MetadataValue = Metadata[keyof Metadata];

export type HandleConfigChange = (key: string, value: unknown) => void;

export type HandleConfigUpdate = (overridingConfig?: ProjectConfig) => void;
