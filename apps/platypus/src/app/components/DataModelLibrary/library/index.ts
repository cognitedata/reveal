import { APM } from './APM';
import { CarbonCapture } from './CarbonCapture';
import { CFIHOS } from './CFIHOS';
import { IEC81346 } from './IEC81346';
import { ISA88 } from './ISA88';
import { ISO14224 } from './ISO14224';
import { ISO15926 } from './ISO15926';
import { MovieDM } from './MovieDM';
import { ValueStream } from './ValueStream';

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
  'Cognite:APM': APM,
  'Cognite:CarbonCapture': CarbonCapture,
  'Cognite:ValueStream': ValueStream,
  'Cognite:ISO15926': ISO15926,
  'Cognite:IEC81346': IEC81346,
  'Cognite:CFIHOS': CFIHOS,
};
