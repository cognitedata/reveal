/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  IDataModelTypeDefsParserService,
} from '@platypus/platypus-core';
import { Kind, NameNode, ObjectTypeDefinitionNode, parse } from 'graphql';
import { DocumentApi, documentApi, fieldDefinitionApi } from 'graphql-extra';

import { DataModelTypeDefsMapper } from './data-mappers/data-model-type-defs-mapper';
import { getBuiltInTypesString } from './utils';

export class TypeDefsParserService implements IDataModelTypeDefsParserService {
  protected schemaAst: DocumentApi | null = null;
  protected dataModelTypeDefsMapper: DataModelTypeDefsMapper;

  constructor() {
    this.dataModelTypeDefsMapper = new DataModelTypeDefsMapper();
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

      const directiveNodes =
        this.dataModelTypeDefsMapper.mapDirectivesFromDefinition(
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
        const mappedType = this.dataModelTypeDefsMapper.toSolutionDataModelType(
          typeApi,
          typeNames
        );
        mappedType.version = views.find(
          (el) => el.externalId === mappedType.name
        )?.version;
        if (typeDef.fields && typeDef.fields.length) {
          mappedType.fields = typeDef.fields.map((field) =>
            this.dataModelTypeDefsMapper.toSolutionDataModelField(
              fieldDefinitionApi(field),
              typeNames
            )
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

  protected createIfEmpty() {
    if (!this.schemaAst) {
      this.schemaAst = documentApi();
    }
  }

  protected getTypeNames() {
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

  protected getDataModelTypeApi(typeName: string) {
    // SchemaAst is not null here because we are always calling this function after parseSchema or createIfEmpty
    // This will populate the typeMap as well
    const typeKind = this.schemaAst!.typeMap.get(typeName)!.kind;

    const isInterfaceKind = typeKind === 'InterfaceTypeDefinition';

    return isInterfaceKind
      ? this.schemaAst!.getInterfaceType(typeName)
      : this.schemaAst!.getObjectType(typeName);
  }
}
