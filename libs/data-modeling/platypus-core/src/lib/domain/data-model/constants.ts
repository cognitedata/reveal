import { BuiltInType } from './types';

export const mixerApiInlineTypeDirectiveName = 'nested';

export const mixerApiBuiltInTypes = [
  { name: 'String', type: 'SCALAR', dmsType: 'text', tsType: 'string' },
  { name: 'Int', type: 'SCALAR', dmsType: 'int32', tsType: 'number' },
  { name: 'Int64', type: 'SCALAR', dmsType: 'int64', tsType: 'number' },
  { name: 'Float', type: 'SCALAR', dmsType: 'float64', tsType: 'number' },
  { name: 'Float32', type: 'SCALAR', dmsType: 'float32', tsType: 'number' },
  { name: 'Float64', type: 'SCALAR', dmsType: 'float64', tsType: 'number' },
  { name: 'Timestamp', type: 'SCALAR', dmsType: 'timestamp', tsType: 'Date' },
  { name: 'JSONObject', type: 'SCALAR', dmsType: 'json', tsType: 'any' },
  { name: 'Date', type: 'SCALAR', dmsType: 'date', tsType: 'Date' },
  { name: 'Boolean', type: 'SCALAR', dmsType: 'boolean', tsType: 'boolean' },
  { name: 'TimeSeries', type: 'SCALAR', dmsType: 'text', tsType: 'string' },
  {
    name: 'view',
    type: 'DIRECTIVE',
    body: 'directive @view(space: String, version: String) on OBJECT | INTERFACE',
    fieldDirective: false,
  },
  {
    name: 'mapping',
    type: 'DIRECTIVE',
    body: 'directive @mapping(space: String, container: String, property: String) on FIELD_DEFINITION',
    fieldDirective: true,
  },
  {
    name: 'relation',
    type: 'DIRECTIVE',
    body: `
    input _DirectRelationRef {
      space: String!
      externalId: String!
    }

    enum _RelationDirection {
      INWARDS
      OUTWARDS
    }
    
    directive @relation(
      type: _DirectRelationRef!,
      direction: _RelationDirection
    ) on FIELD_DEFINITION
    `,
    fieldDirective: true,
  },
  {
    name: 'container',
    type: 'DIRECTIVE',
    body: `
    input _ConstraintDefinition {
      identifier: String!
      constraintType: _ConstraintType
      require: _DirectRelationRef
      fields: [String!]
    }

    enum _ConstraintType {
      UNIQUENESS
      REQUIRES
    }

    enum _IndexType {
      BTREE
    }

    input _IndexDefinition {
      identifier: String!
      indexType: _IndexType
      fields: [String!]!
    }

    directive @container(
      constraints: [_ConstraintDefinition!],
      indexes: [_IndexDefinition!]
    ) on OBJECT | INTERFACE
    `,
    fieldDirective: false,
  },
] as BuiltInType[];
