import { DiagramAnnotationType } from '../types';

import { LineWalkSymbolType } from './types';

export const lineWalkSymbolTypes = [
  'line',
  'equipment',
  'tag',
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
  'equipmentTag',
  'lineConnectionTag',
] as const;

export const symbolTypeMap: {
  [key in DiagramAnnotationType]: LineWalkSymbolType;
} = {
  Line: 'line',
  Equipment: 'equipment',
  'Equipment Tag': 'equipmentTag',
  'Line Connection Tag': 'lineConnectionTag',
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
