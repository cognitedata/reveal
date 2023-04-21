import { BuiltInType } from './types';

export const mixerApiInlineTypeDirectiveName = 'nested';

export const mixerApiBuiltInTypes = [
  {
    name: 'String',
    type: 'SCALAR',
    dmsType: 'text',
  },
  {
    name: 'Int',
    type: 'SCALAR',
    dmsType: 'int32',
  },
  {
    name: 'Int32',
    type: 'SCALAR',
    dmsType: 'int32',
  },
  {
    name: 'Int64',
    type: 'SCALAR',
    dmsType: 'int64',
  },
  { name: 'Float', type: 'SCALAR', dmsType: 'float64' },
  { name: 'Float32', type: 'SCALAR', dmsType: 'float32' },
  { name: 'Float64', type: 'SCALAR', dmsType: 'float64' },
  {
    name: 'Timestamp',
    type: 'SCALAR',
    dmsType: 'timestamp',
  },
  { name: 'JSONObject', type: 'SCALAR', dmsType: 'json' },
  { name: 'Date', type: 'SCALAR', dmsType: 'date' },
  {
    name: 'Boolean',
    type: 'SCALAR',
    dmsType: 'boolean',
    filterType: 'boolean',
  },
  { name: 'TimeSeries', type: 'SCALAR', dmsType: 'text' },
  {
    name: 'readonly',
    type: 'DIRECTIVE',
    body: 'directive @readonly on OBJECT | INTERFACE',
    fieldDirective: false,
  },
  {
    name: 'import',
    type: 'DIRECTIVE',
    body: 'directive @import on OBJECT | INTERFACE',
    fieldDirective: false,
  },
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
