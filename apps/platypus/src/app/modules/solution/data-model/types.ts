export enum SchemaEditorMode {
  View,
  Edit,
}

export type TypeFieldValues = {
  name: string;
  type: {
    value: string;
    label: string;
  };
  required: boolean;
};
