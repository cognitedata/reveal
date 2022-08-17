/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IGraphQlUtilsService } from '@platypus-core/domain/data-model/boundaries';
import {
  DirectiveProps,
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsFieldArgument,
  DataModelTypeDefsType,
  UpdateDataModelFieldDTO,
  DataModelValidationError,
  BuiltInType,
} from '@platypus/platypus-core';
import {
  ObjectTypeDefinitionNode,
  parse,
  buildSchema,
  GraphQLError,
  DocumentNode,
} from 'graphql';

import {
  documentApi,
  DocumentApi,
  fieldDefinitionApi,
  FieldDefinitionApi,
  FieldDefinitionNodeProps,
  objectTypeApi,
  ObjectTypeApi,
  DirectiveApi,
  InputValueApi,
} from 'graphql-extra';
import {
  validate as validateFromGql,
  ValidationRule,
} from 'graphql/validation';
import { validateSDL } from 'graphql/validation/validate';
import { NotSupportedFeaturesRule } from './validation/NotSupportedFeaturesRule';

export class GraphQlUtilsService implements IGraphQlUtilsService {
  private schemaAst: DocumentApi | null = null;

  addType(name: string, directive?: string): DataModelTypeDefsType {
    this.createIfEmpty();
    const newType = this.schemaAst!.createObjectType({
      name: name,
      directives: directive ? [directive] : [],
    });

    return this.toSolutionDataModelType(newType);
  }

  updateType(
    typeName: string,
    updates: Partial<DataModelTypeDefsType>
  ): DataModelTypeDefsType {
    this.createIfEmpty();

    const type = this.schemaAst!.getObjectType(typeName);
    if (updates.name && updates.name !== type.getName()) {
      // Should probably use updateType() but that function is not exposed for some reason??
      // https://graphql-extra.netlify.app/classes/documentapi.html#updatetype
      type.setName(updates.name);
      this.schemaAst!.typeMap.set(
        updates.name,
        this.schemaAst!.typeMap.get(typeName)!
      );
      this.schemaAst!.typeMap.delete(typeName);
    }

    if (updates.description && updates.description !== type.getDescription()) {
      type.setDescription(updates.description);
    }

    if (updates.directives) {
      if (!updates.directives.length) {
        type.getDirectives().forEach((directive) => {
          type.removeDirective(directive.getName());
        });
      } else {
        updates.directives.forEach((directive) => {
          if (type.hasDirective(directive.name)) {
            type.updateDirective(directive.name, directive);
          } else {
            type.createDirective(directive);
          }
        });
      }
    }

    return this.toSolutionDataModelType(type);
  }

  removeType(typeName: string): void {
    this.createIfEmpty();
    this.schemaAst!.removeType(typeName);
  }

  getType(typeName: string): DataModelTypeDefsType {
    return this.toSolutionDataModelType(
      this.schemaAst!.getObjectType(typeName)
    );
  }

  addField(
    typeName: string,
    fieldName: string,
    fieldProps: Partial<DataModelTypeDefsField>
  ): DataModelTypeDefsField {
    this.createIfEmpty();
    const updatedFieldName = fieldProps.name ? fieldProps.name : fieldName;
    const createdType = this.schemaAst!.getObjectType(typeName).createField(
      fieldProps as FieldDefinitionNodeProps
    );
    return this.toSolutionDataModelField(
      createdType.getField(updatedFieldName),
      fieldProps.id
    );
  }

  updateTypeField(
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateDataModelFieldDTO>
  ): DataModelTypeDefsField {
    this.createIfEmpty();
    const updatedFieldName = updates.name ? updates.name : fieldName;
    const updatedType = this.schemaAst!.getObjectType(typeName).updateField(
      fieldName,
      updates
    );

    const updatedField = this.toSolutionDataModelField(
      updatedType.getField(updatedFieldName),
      updates.id
    );
    if (!updatedField.location && updates.location) {
      updatedField.location = updates.location;
    }
    return updatedField;
  }

  removeField(typeName: string, fieldName: string): void {
    this.createIfEmpty();
    this.schemaAst!.getObjectType(typeName).removeField(fieldName);
  }

  parseSchema(graphQlSchema: string): DataModelTypeDefs {
    if (!graphQlSchema) {
      this.clear();
      return {
        types: [],
      } as DataModelTypeDefs;
    }

    const schemaAst = parse(graphQlSchema);
    this.schemaAst = documentApi().addSDL(schemaAst);
    const types = [...this.schemaAst.typeMap.keys()].map((type) =>
      this.schemaAst!.typeMap.get(type)
    );

    const mappedTypes: DataModelTypeDefsType[] = types.map((type) => {
      const typeDef = type as ObjectTypeDefinitionNode;
      const typeApi = objectTypeApi(typeDef);
      const mappedType = this.toSolutionDataModelType(typeApi);
      if (typeDef.fields && typeDef.fields.length) {
        mappedType.fields = typeDef.fields.map((field) =>
          this.toSolutionDataModelField(fieldDefinitionApi(field))
        );
      }

      return mappedType;
    });

    return {
      types: mappedTypes,
    } as DataModelTypeDefs;
  }

  hasType(typeName: string): boolean {
    this.createIfEmpty();
    return this.schemaAst!.hasType(typeName);
  }

  hasTypeField(typeName: string, fieldName: string): boolean {
    this.createIfEmpty();
    return this.schemaAst!.getObjectType(typeName).hasField(fieldName);
  }

  generateSdl(): string {
    this.createIfEmpty();
    const sdl = this.schemaAst!.toSDLString();
    return sdl === '\n' ? '' : sdl;
  }

  private toSolutionDataModelType(type: ObjectTypeApi): DataModelTypeDefsType {
    return {
      name: type.getName(),
      description: type.getDescription(),
      fields: type
        .getFields()
        .map((field) => this.toSolutionDataModelField(field)),
      interfaces: type.node.interfaces?.map(
        (typeInterface) => typeInterface.name.value
      ),
      directives: this.mapDirectives(type.getDirectives()),
      location: type.node.loc
        ? {
            line: type.node.loc.startToken.line,
            column: type.node.loc.endToken.column,
          }
        : undefined,
    } as DataModelTypeDefsType;
  }

  private toSolutionDataModelField(
    field: FieldDefinitionApi,
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
      },
      nonNull: field.isNonNullType(),
      directives: this.mapDirectives(field.getDirectives()),
      arguments: this.mapArguments(field.getArguments()),
      location: field.node.loc
        ? {
            line: field.node.loc.startToken.line,
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
      arguments: directive
        .getArguments()
        .map((arg) => ({ name: arg.getName(), value: arg.getValue() })),
    }));
  }

  private createIfEmpty() {
    if (!this.schemaAst) {
      this.schemaAst = documentApi();
    }
  }

  clear() {
    this.schemaAst = documentApi();
  }

  validate(
    graphQlString: string,
    builtInTypes: BuiltInType[]
  ): DataModelValidationError[] {
    const generateBuiltIntTypes = () => {
      return builtInTypes.map((builtInType) => {
        if (builtInType.type === 'DIRECTIVE' && !builtInType.fieldDirective) {
          return `directive @${builtInType.name} on OBJECT`;
        } else if (
          builtInType.type === 'DIRECTIVE' &&
          builtInType.fieldDirective
        ) {
          return `directive @${builtInType.name} on FIELD_DEFINITION`;
        } else if (builtInType.type === 'OBJECT') {
          return `type ${builtInType.name} {}`;
        } else {
          return `scalar ${builtInType.name}`;
        }
      });
    };

    if (graphQlString === '') {
      return [
        {
          message: 'Your Data Model Schema is empty',
          errorMessage: 'Your Data Model Schema is empty',
          status: 400,
        },
      ];
    }

    // we need this to be able to parse and validate the schema properly
    const schemaToValidate = `${graphQlString}
${generateBuiltIntTypes().join('\n')}
type Query {
  test: String
}
    `;

    const customValidationRules = [
      NotSupportedFeaturesRule,
    ] as ValidationRule[];

    let errors = [];
    let doc: DocumentNode;

    try {
      doc = parse(schemaToValidate);
      errors = validateSDL(doc);

      if (errors.length) {
        return errors.map((err) => this.graphQlToValidationError(err));
      }

      errors = validateFromGql(
        buildSchema(schemaToValidate),
        doc,
        Object.freeze(customValidationRules)
      ).map((err) => err);
    } catch (err) {
      errors = [err];
    }

    return errors.map((err) => this.graphQlToValidationError(err));
  }

  private graphQlToValidationError(
    error: GraphQLError
  ): DataModelValidationError {
    let typeName = undefined;
    let fieldName = undefined;

    if (error.nodes?.length) {
      const node = error.nodes[0];

      if (node.kind === 'ObjectTypeDefinition') {
        const typeDef = objectTypeApi(node);
        typeName = typeDef.getName();

        if (node.fields?.length) {
          const fieldDef = fieldDefinitionApi(node.fields[0]);
          fieldName = fieldDef.getName();
        }
      }
    }
    return {
      message: error.message,
      status: 400,
      errorMessage: error.message,
      typeName,
      fieldName,
      locations: error.locations?.map((loc) => ({
        line: loc.line,
        column: loc.column,
      })),
    };
  }
}
