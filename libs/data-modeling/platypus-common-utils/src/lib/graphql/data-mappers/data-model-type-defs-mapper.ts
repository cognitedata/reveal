/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ArgumentNodeProps,
  DataModelTypeDefsField,
  DataModelTypeDefsFieldArgument,
  DataModelTypeDefsType,
  DirectiveProps,
} from '@platypus/platypus-core';
import { DirectiveDefinitionNode } from 'graphql';
import {
  DirectiveApi,
  FieldDefinitionApi,
  InputValueApi,
  InterfaceTypeApi,
  ObjectTypeApi,
} from 'graphql-extra';

const DIRECTIVE_ARGUMENTS_KIND_MAP: {
  [key: DirectiveProps['name']]: {
    [key: ArgumentNodeProps['name']]: ArgumentNodeProps['kind'];
  };
} = {
  mapping: {
    container: 'type',
    property: 'field',
  },
  view: {
    name: 'type',
  },
};

export class DataModelTypeDefsMapper {
  toSolutionDataModelType(
    type: ObjectTypeApi | InterfaceTypeApi,
    typeNames: Set<string>
  ): DataModelTypeDefsType {
    return {
      name: type.getName(),
      description: type.getDescription(),
      fields: type
        .getFields()
        .map((field) => this.toSolutionDataModelField(field, typeNames)),
      interfaces: type.node.interfaces?.map(
        (typeInterface) => typeInterface.name.value
      ),
      isReadOnly: type.hasDirective('readonly') || type.hasDirective('import'),
      kind: type.node.kind === 'InterfaceTypeDefinition' ? 'interface' : 'type',
      directives: this.mapDirectives(type.getDirectives()),
      location: type.node.loc
        ? {
            line: type.node.loc.startToken.line,
            column: type.node.loc.endToken.column,
          }
        : undefined,
    } as DataModelTypeDefsType;
  }

  toSolutionDataModelField(
    field: FieldDefinitionApi,
    typeNames: Set<string>,
    fieldId?: string
  ): DataModelTypeDefsField {
    return {
      id: fieldId || field.getName(),
      name: field.getName(),
      description: field.getDescription(),
      type: {
        name: field.getTypename(),
        list: field.isListType(),
        nonNull: field.isNonNullType(),
        custom: typeNames.has(field.getTypename()),
      },
      nonNull: field.isNonNullType(),
      directives: this.mapDirectives(field.getDirectives()),
      arguments: this.mapArguments(field.getArguments()),
      location: field.node.loc
        ? {
            line: field.node.loc.endToken.line,
            column: field.node.loc.endToken.column,
          }
        : undefined,
    } as DataModelTypeDefsField;
  }

  private mapArguments(
    args: InputValueApi[]
  ): DataModelTypeDefsFieldArgument[] {
    return (args || []).map(
      (arg) =>
        ({
          name: arg.getName(),
          description: arg.getDescription(),
          defaultValue: arg.getDefaultValue(),
          directives: this.mapDirectives(arg.getDirectives()),
          type: {
            name: arg.getTypename(),
            list: arg.isListType(),
            nonNull: arg.isNonNullType(),
          },
        } as DataModelTypeDefsFieldArgument)
    );
  }

  private mapDirectives(directives: DirectiveApi[]): DirectiveProps[] {
    return (directives || []).map((directive) => ({
      name: directive.getName(),
      arguments: directive.getArguments().map((arg) => ({
        name: arg.getName(),
        value: JSON.parse(JSON.stringify(arg.getValue())),
      })),
    }));
  }

  mapDirectivesFromDefinition(
    directives: DirectiveDefinitionNode[]
  ): DirectiveProps[] {
    return (directives || []).map((directive) => ({
      name: directive.name.value,
      arguments: (directive.arguments || []).map((arg) => ({
        name: arg.name.value,
        value: undefined,
        kind: DIRECTIVE_ARGUMENTS_KIND_MAP[directive.name.value]?.[
          arg.name.value
        ],
      })),
    }));
  }
}
