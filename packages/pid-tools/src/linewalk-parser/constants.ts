import { DiagramType } from '../types';

import { LineWalkSymbolType } from './types';

export const lineWalkSymbolTypes = [
  'line',
  'equipment',
  'equipmentType',
  'fileConnection',
  'instrument',
  'valve',
  'reducer',
  'flange',
  'cap',
  'insulation',
  'arrow',
  'custom',
  'sharedInstrument',
  'lineBreak',
] as const;

export const symbolTypeMap: {
  [key in DiagramType]: LineWalkSymbolType;
} = {
  Line: 'line',
  Equipment: 'equipment',
  EquipmentTag: 'equipmentType',
  'File Connection': 'fileConnection',
  'Bypass Connection': 'fileConnection',
  'Line Connection': 'fileConnection',
  Instrument: 'instrument',
  Valve: 'valve',
  Reducer: 'reducer',
  Flange: 'flange',
  Cap: 'cap',
  Insulation: 'insulation',
  Arrow: 'arrow',
  Custom: 'custom',
  'Shared Instrument': 'sharedInstrument',
  'Line Break': 'lineBreak',
} as const;
