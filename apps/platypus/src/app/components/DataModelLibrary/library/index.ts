import { ISA88 } from './ISA88';
import { ISO14224 } from './ISO14224';
import { MovieDM } from './MovieDM';

export type DataModelLibraryTemplateItem = {
  name: string;
  versions: { dml: string; version: string; date: Date }[];
  category?: string;
  description?: string;
};

export type DataModelLibraryItem = {
  id: string;
  isTemplate?: boolean;
} & DataModelLibraryTemplateItem;

export const library: { [key in string]: DataModelLibraryTemplateItem } = {
  'Cognite:MovieDM': MovieDM,
  'Cognite:ISA-88': ISA88,
  'Cognite:ISO-14224': ISO14224,
};
