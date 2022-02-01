import { DiagramType } from '../types';

import { LineWalkSymbolType } from './types';

export const lineWalkSymbolTypes = [
  'line',
  'equipmentType',
  'fileConnection',
  'instrument',
  'valve',
  'reducer',
  'flange',
  'cap',
  'insolation',
  'arrow',
  'custom',
] as const;

export const symbolTypeMap: {
  [key in DiagramType]: LineWalkSymbolType;
} = {
  Line: 'line',
  EquipmentTag: 'equipmentType',
  'File connection': 'fileConnection',
  Instrument: 'instrument',
  Valve: 'valve',
  Reducer: 'reducer',
  Flange: 'flange',
  Cap: 'cap',
  Insolation: 'insolation',
  Arrow: 'arrow',
  Custom: 'custom',
} as const;
