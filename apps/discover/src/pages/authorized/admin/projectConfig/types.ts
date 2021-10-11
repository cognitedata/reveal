export type PrimitiveValue = string | number | boolean;

export type Config = {
  [key: string]: PrimitiveValue | Config | undefined;
};

export type ValueTypes = 'string' | 'number' | 'boolean' | 'object';

export type Metadata = {
  [key: string]: {
    label: string;
    helpText?: string;
    children?: Metadata;
    type?: 'boolean' | 'string' | 'number' | 'object' | 'array';
  };
};

export type MetadataKey = keyof Metadata;

export type MetadataValue = Metadata[keyof Metadata];

export type HandleMetadataChange = (key: string, value: unknown) => void;
