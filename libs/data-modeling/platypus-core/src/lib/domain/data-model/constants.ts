import { BuiltInType } from './types';

export const mixerApiInlineTypeDirectiveName = 'nested';

export const mixerApiBuiltInTypes = [
  { name: 'String', type: 'SCALAR', dmsType: 'text', tsType: 'string' },
  { name: 'Int', type: 'SCALAR', dmsType: 'int32', tsType: 'number' },
  {
    name: 'Int32',
    type: 'SCALAR',
    dmsType: 'int32',
    tsType: 'number',
  },
  { name: 'Int64', type: 'SCALAR', dmsType: 'int64', tsType: 'number' },
  { name: 'Float', type: 'SCALAR', dmsType: 'float64', tsType: 'number' },
  { name: 'Float32', type: 'SCALAR', dmsType: 'float32', tsType: 'number' },
  { name: 'Float64', type: 'SCALAR', dmsType: 'float64', tsType: 'number' },
  { name: 'Timestamp', type: 'SCALAR', dmsType: 'timestamp', tsType: 'Date' },
  { name: 'JSONObject', type: 'SCALAR', dmsType: 'json', tsType: 'any' },
  { name: 'Date', type: 'SCALAR', dmsType: 'date', tsType: 'Date' },
  { name: 'Boolean', type: 'SCALAR', dmsType: 'boolean', tsType: 'boolean' },
  { name: 'File', type: 'SCALAR', dmsType: 'text', tsType: 'string' },
  { name: 'Sequence', type: 'SCALAR', dmsType: 'text', tsType: 'string' },
  { name: 'TimeSeries', type: 'SCALAR', dmsType: 'text', tsType: 'string' },
  {
    name: 'readonly',
    type: 'DIRECTIVE',
    body: 'directive @readonly on OBJECT | INTERFACE',
    fieldDirective: false,
  },
  {
    name: 'import',
    type: 'DIRECTIVE',
    body: `
    input _DataModelRef {
      space: String!
      externalId: String!
      version: String!
    }
    directive @import(dataModel: _DataModelRef) on OBJECT | INTERFACE
`,
    fieldDirective: false,
  },
  {
    name: 'view',
    type: 'DIRECTIVE',
    body: 'directive @view(space: String, version: String, rawFilter: JSONObject) on OBJECT | INTERFACE',
    fieldDirective: false,
  },
  {
    name: 'edge',
    type: 'DIRECTIVE',
    body: 'directive @edge on OBJECT | INTERFACE',
    fieldDirective: false,
  },
  {
    name: 'mapping',
    type: 'DIRECTIVE',
    body: 'directive @mapping(space: String, container: String, property: String) on FIELD_DEFINITION',
    fieldDirective: true,
  },
  {
    name: 'default',
    type: 'DIRECTIVE',
    body: `directive @default(value: String) on FIELD_DEFINITION`,
    fieldDirective: true,
  },
  {
    name: 'unit',
    type: 'DIRECTIVE',
    body: `directive @unit(space: String, externalId: String) on FIELD_DEFINITION`,
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

    """
    Defines the relation field's details
    
    * name: Overrides the name property of the relation definition. This is merely metadata, and should not be confused with the property identifier!
    * direction: The direction to follow the edges filtered by 'type'.
    * type: Specifies the edge type, namespaced by 'space', where the 'externalId' corresponds to the edge type name.
    * edgeSource: Specifies the GraphQL type which defines the edge properties to be stored for this relation
    """
    directive @relation(
      type: _DirectRelationRef
      name: String
      direction: _RelationDirection
      edgeSource: String
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
      INVERTED
    }

    input _IndexDefinition {
      identifier: String!
      indexType: _IndexType
      fields: [String!]!
      cursorable: Boolean
    }

    directive @container(
      constraints: [_ConstraintDefinition!],
      indexes: [_IndexDefinition!]
    ) on OBJECT | INTERFACE
    `,
    fieldDirective: false,
  },
] as BuiltInType[];
