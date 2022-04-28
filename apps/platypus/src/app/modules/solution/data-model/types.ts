import { DirectiveBuiltInType } from '@platypus/platypus-core';
import { IconType } from '@cognite/cogs.js';

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

export type FieldSchemaDirectiveType = Omit<DirectiveBuiltInType, 'icon'> & {
  icon: IconType;
};
