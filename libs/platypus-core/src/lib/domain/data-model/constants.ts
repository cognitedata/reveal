import { BuiltInType } from './types';

export const templatesBiltInTypes = [
  { name: 'String', type: 'SCALAR' },
  { name: 'Int', type: 'SCALAR' },
  { name: 'Float', type: 'SCALAR' },
  { name: 'Boolean', type: 'SCALAR' },
  { name: 'ID', type: 'SCALAR' },
  { name: 'Long', type: 'SCALAR' },
  { name: 'TimeSeries', type: 'OBJECT' },
  { name: 'SyntheticTimeSeries', type: 'OBJECT' },
  { name: 'Sequence', type: 'OBJECT' },
  { name: 'File', type: 'OBJECT' },
  { name: 'Asset', type: 'OBJECT' },
  { name: 'template', type: 'DIRECTIVE', fieldDirective: false },
] as BuiltInType[];

export const mixerApiBuiltInTypes = [
  { name: 'String', type: 'SCALAR', dmsType: 'text' },
  { name: 'Int', type: 'SCALAR', dmsType: 'int32' },
  { name: 'Int64', type: 'SCALAR', dmsType: 'int64' },
  { name: 'Float', type: 'SCALAR', dmsType: 'float32' },
  { name: 'Boolean', type: 'SCALAR', dmsType: 'boolean' },
  { name: 'Timestamp', type: 'SCALAR', dmsType: 'timestamp' },
  { name: 'JSONObject', type: 'SCALAR', dmsType: 'json' },
  { name: 'TimeSeries', type: 'SCALAR', dmsType: 'text' },
  { name: 'view', type: 'DIRECTIVE', fieldDirective: false },
] as BuiltInType[];
