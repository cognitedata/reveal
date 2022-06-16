import { BuiltInType } from './types';

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
