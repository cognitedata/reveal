import { BuiltInType } from './types';

export const mixerApiInlineTypeDirectiveName = 'nested';

export const mixerApiBuiltInTypes = [
  { name: 'String', type: 'SCALAR', dmsType: 'text' },
  { name: 'Int', type: 'SCALAR', dmsType: 'int32' },
  { name: 'Int64', type: 'SCALAR', dmsType: 'int64' },
  { name: 'Float', type: 'SCALAR', dmsType: 'float64' },
  { name: 'Boolean', type: 'SCALAR', dmsType: 'boolean' },
  { name: 'Timestamp', type: 'SCALAR', dmsType: 'timestamp' },
  { name: 'JSONObject', type: 'SCALAR', dmsType: 'json' },
  { name: 'TimeSeries', type: 'SCALAR', dmsType: 'text' },
  {
    name: 'view',
    type: 'DIRECTIVE',
    body: '(space: String, name: String, version: String)',
    fieldDirective: false,
  },
  {
    name: 'mapping',
    type: 'DIRECTIVE',
    body: '(space: String, container: String, containerPropertyIdentifier: String)',
    fieldDirective: true,
  },
] as BuiltInType[];
