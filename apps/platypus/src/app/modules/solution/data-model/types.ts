export enum SchemaEditorMode {
  View = 'VIEW',
  Edit = 'EDIT',
}

export type TypeFieldValues = {
  name: string;
  type: {
    value: string;
    label: string;
  };
  required: boolean;
};
