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

export const schemaServiceBuiltInTypes = [
  { name: 'String', type: 'SCALAR' },
  { name: 'Int', type: 'SCALAR' },
  { name: 'Float', type: 'SCALAR' },
  { name: 'Boolean', type: 'SCALAR' },
  { name: 'Timestamp', type: 'SCALAR' },
  { name: 'JSONObject', type: 'SCALAR' },
  { name: 'view', type: 'DIRECTIVE', fieldDirective: false },
  {
    name: 'filterable',
    type: 'DIRECTIVE',
    fieldDirective: true,
    icon: 'Filter',
  },
  {
    name: 'searchable',
    type: 'DIRECTIVE',
    fieldDirective: true,
    icon: 'Search',
  },
] as BuiltInType[];
