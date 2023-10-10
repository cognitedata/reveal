/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DirectiveProps,
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsFieldArgument,
  DataModelTypeDefsType,
  UpdateDataModelFieldDTO,
  DataModelValidationError,
  ArgumentNodeProps,
  IGraphQlUtilsService,
  DataModelTypeDefsTypeKind,
} from '@platypus/platypus-core';
import {
  ObjectTypeDefinitionNode,
  parse,
  buildSchema,
  GraphQLError,
  DocumentNode,
  Kind,
  NameNode,
  DirectiveDefinitionNode,
  validateSchema,
} from 'graphql';
import { validateSDL } from 'graphql/validation/validate';
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
  InterfaceTypeApi,
  ObjectTypeDefinitionNodeProps,
} from 'graphql-extra';
import { validateWithCustomRules } from 'graphql-language-service';

import { getBuiltInTypesString } from './utils';
import { ContainerDirectiveValidator } from './validation/ContainerDirectiveValidator';
import { FieldNodeValidator } from './validation/FieldNodeValidator';
import { NotSupportedFeaturesRule } from './validation/NotSupportedFeaturesRule';

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

export class GraphQlUtilsService implements IGraphQlUtilsService {
  private schemaAst: DocumentApi | null = null;

  addType(
    name: string,
    kind: DataModelTypeDefsTypeKind = 'type',
    directive?: string
  ): DataModelTypeDefsType {
    this.createIfEmpty();
    const createPayload = {
      name: name,
      directives: directive ? [directive] : [],
    } as ObjectTypeDefinitionNodeProps;

    const isInterfaceKind = kind === 'interface';

    // schemaAst is not empty here, createIfEmpty is called at the beginning of the function
    // that creates the schemaAst and typeMap
    const newType = isInterfaceKind
      ? this.schemaAst!.createInterfaceType(createPayload)
      : this.schemaAst!.createObjectType(createPayload);

    const typeNames = this.getTypeNames();

    return this.toSolutionDataModelType(newType, typeNames);
  }

  updateType(
    typeName: string,
    updates: Partial<DataModelTypeDefsType>
  ): DataModelTypeDefsType {
    this.createIfEmpty();

    const type = this.getDataModelTypeApi(typeName);
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

    const typeNames = this.getTypeNames();

    return this.toSolutionDataModelType(type, typeNames);
  }

  setType(typeName: string, type: DataModelTypeDefsType): void {
    this.createIfEmpty();
    this.schemaAst!.createObjectType({
      name: typeName,
      directives: type.directives,
      description: type.description,
      interfaces: type.interfaces,
      // keep JSON parse otherwise you will get max callstack exceeded
      fields: type.fields.map((field) => JSON.parse(JSON.stringify(field))),
    });
  }

  removeType(typeName: string): void {
    this.createIfEmpty();
    this.schemaAst!.removeType(typeName);
  }

  getType(typeName: string): DataModelTypeDefsType {
    const typeNames = this.getTypeNames();
    return this.toSolutionDataModelType(
      this.schemaAst!.getObjectType(typeName),
      typeNames
    );
  }

  addField(
    typeName: string,
    fieldName: string,
    fieldProps: Partial<DataModelTypeDefsField>
  ): DataModelTypeDefsField {
    this.createIfEmpty();
    const updatedFieldName = fieldProps.name ? fieldProps.name : fieldName;
    const dataModelType = this.getDataModelTypeApi(typeName);
    const createdType = dataModelType.createField(
      fieldProps as FieldDefinitionNodeProps
    );
    const typeNames = this.getTypeNames();
    return this.toSolutionDataModelField(
      createdType.getField(updatedFieldName),
      typeNames,
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
    const dataModelType = this.getDataModelTypeApi(typeName);
    const updatedType = dataModelType.updateField(fieldName, updates);
    const typeNames = this.getTypeNames();

    const updatedField = this.toSolutionDataModelField(
      updatedType.getField(updatedFieldName),
      typeNames,
      updates.id
    );
    if (!updatedField.location && updates.location) {
      updatedField.location = updates.location;
    }
    return updatedField;
  }

  removeField(typeName: string, fieldName: string): void {
    this.createIfEmpty();
    const dataModelType = this.getDataModelTypeApi(typeName);
    dataModelType.removeField(fieldName);
  }

  parseSchema(
    graphQlSchema: string,
    views: { externalId: string; version: string }[] = [],
    includeBuiltInTypes: boolean = false
  ): DataModelTypeDefs {
    const dataModelTypeDefs: DataModelTypeDefs = {
      types: [],
    };
    if (!graphQlSchema) {
      this.clear();
      return dataModelTypeDefs;
    }

    const graphQlSchemaString = includeBuiltInTypes
      ? // order has to be this way for correct monaco errors
        [graphQlSchema, getBuiltInTypesString()].join('\n')
      : graphQlSchema;

    const schemaAst = parse(graphQlSchemaString);
    this.schemaAst = documentApi().addSDL(schemaAst);

    if (includeBuiltInTypes) {
      const directiveNames: NameNode[] = [
        ...this.schemaAst!.directiveMap.keys(),
      ]
        .map((directive) => this.schemaAst!.directiveMap!.get(directive)!.name)
        .filter((node) => !!node);

      const directiveNodes = this.mapDirectivesFromDefinition(
        directiveNames.map(
          (directive) => this.schemaAst!.getDirective(directive.value).node
        )
      );

      dataModelTypeDefs.directives = directiveNodes;
    }

    const types = [...this.schemaAst.typeMap.keys()].map((type) =>
      this.schemaAst!.typeMap.get(type)
    );
    const typeNames = this.getTypeNames();

    dataModelTypeDefs.types = types
      // We will only parse Objects types for now
      .filter(
        (type) =>
          type &&
          (type.kind === Kind.OBJECT_TYPE_DEFINITION ||
            type.kind === Kind.INTERFACE_TYPE_DEFINITION)
      )
      .map((type) => {
        const typeDef = type as ObjectTypeDefinitionNode;

        const typeApi = this.getDataModelTypeApi(typeDef.name.value);
        const mappedType = this.toSolutionDataModelType(typeApi, typeNames);
        mappedType.version = views.find(
          (el) => el.externalId === mappedType.name
        )?.version;
        if (typeDef.fields && typeDef.fields.length) {
          mappedType.fields = typeDef.fields.map((field) =>
            this.toSolutionDataModelField(fieldDefinitionApi(field), typeNames)
          );
        }

        return mappedType;
      });

    return dataModelTypeDefs;
  }

  hasType(typeName: string): boolean {
    this.createIfEmpty();
    return this.schemaAst!.hasType(typeName);
  }

  hasTypeField(typeName: string, fieldName: string): boolean {
    this.createIfEmpty();
    const dataModelType = this.getDataModelTypeApi(typeName);
    return dataModelType.hasField(fieldName);
  }

  generateSdl(): string {
    this.createIfEmpty();
    const sdl = this.schemaAst!.toSDLString();
    return sdl === '\n' ? '' : sdl;
  }

  private toSolutionDataModelType(
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

  private toSolutionDataModelField(
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

  private mapDirectivesFromDefinition(
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

  private createIfEmpty() {
    if (!this.schemaAst) {
      this.schemaAst = documentApi();
    }
  }

  private getTypeNames() {
    const dataTypeNames: Set<string> = new Set();
    if (this.schemaAst) {
      const types = [...this.schemaAst.typeMap.keys()].map((type) =>
        this.schemaAst!.typeMap.get(type)
      );

      for (const type of types) {
        if (
          type &&
          (type.kind === Kind.OBJECT_TYPE_DEFINITION ||
            type.kind === Kind.INTERFACE_TYPE_DEFINITION)
        ) {
          dataTypeNames.add(type.name.value);
        }
      }
    }
    return dataTypeNames;
  }

  clear() {
    this.schemaAst = documentApi();
  }

  validate(
    graphQlString: string,
    options?: {
      useExtendedSdl: boolean;
    }
  ): DataModelValidationError[] {
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
    const queryType = `type Query {
      test: String
    }`;

    const schemaToValidate =
      graphQlString + getBuiltInTypesString() + queryType;

    const customValidationRules = [
      NotSupportedFeaturesRule,
      FieldNodeValidator,
    ];

    if (options && options.useExtendedSdl) {
      customValidationRules.push(ContainerDirectiveValidator);
    }

    let errors: GraphQLError[] = [];
    let doc: DocumentNode | null = null;

    try {
      doc = parse(schemaToValidate);
      errors = validateSDL(doc).slice();
      if (errors.length) {
        return errors.map((err) => this.graphQlToValidationError(err));
      }
      errors = validateSchema(buildSchema(schemaToValidate)).slice();
      if (errors.length) {
        return errors.map((err) => {
          const locations = err.locations?.slice(1);
          const newGQLError = { ...err, locations } as unknown as GraphQLError;
          return this.graphQlToValidationError(newGQLError);
        });
      }
      errors = validateWithCustomRules(
        buildSchema(schemaToValidate),
        doc,
        customValidationRules
      );
    } catch (err) {
      if (err instanceof GraphQLError) {
        errors = [err];
      }
    }
    return errors.map((err) => this.graphQlToValidationError(err));
  }

  private getDataModelTypeApi(typeName: string) {
    // SchemaAst is not null here because we are always calling this function after parseSchema or createIfEmpty
    // This will populate the typeMap as well
    const typeKind = this.schemaAst!.typeMap.get(typeName)!.kind;

    const isInterfaceKind = typeKind === 'InterfaceTypeDefinition';

    return isInterfaceKind
      ? this.schemaAst!.getInterfaceType(typeName)
      : this.schemaAst!.getObjectType(typeName);
  }

  private graphQlToValidationError(
    error: GraphQLError
  ): DataModelValidationError {
    let typeName: string | undefined = undefined;
    let fieldName: string | undefined = undefined;

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
