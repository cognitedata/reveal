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
  };
};

export type MetadataKey = keyof Metadata;

export type MetadataValue = Metadata[keyof Metadata];

export type HandleMetadataChange = (key: string, value: unknown) => void;
