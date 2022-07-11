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
    hidden?: boolean;
    editInline?: boolean;
    disabled?: boolean;
  };
};
