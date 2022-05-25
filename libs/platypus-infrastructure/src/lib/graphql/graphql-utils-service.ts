/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IGraphQlUtilsService } from '@platypus-core/domain/data-model/boundaries';
import {
  DirectiveProps,
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsFieldArgument,
  DataModelTypeDefsType,
  UpdateSolutionDataModelFieldDTO,
} from '@platypus/platypus-core';
import { ObjectTypeDefinitionNode } from 'graphql';
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
// import { DomainModelSchemaDataMapper } from './solution-data-model-mapper';

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
      createdType.getField(updatedFieldName)
    );
  }

  updateTypeField(
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateSolutionDataModelFieldDTO>
  ): DataModelTypeDefsField {
    this.createIfEmpty();
    const updatedFieldName = updates.name ? updates.name : fieldName;
    const updatedType = this.schemaAst!.getObjectType(typeName).updateField(
      fieldName,
      updates
    );
    return this.toSolutionDataModelField(
      updatedType.getField(updatedFieldName)
    );
  }

  removeField(typeName: string, fieldName: string): void {
    this.createIfEmpty();
    this.schemaAst!.getObjectType(typeName).removeField(fieldName);
  }

  parseSchema(graphQlSchema: string): DataModelTypeDefs {
    this.schemaAst = documentApi().addSDL(graphQlSchema);

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
    return this.schemaAst!.toSDLString();
  }

  private toSolutionDataModelType(type: ObjectTypeApi): DataModelTypeDefsType {
    return {
      name: type.getName(),
      description: type.getDescription(),
      fields: type
        .getFields()
        .map((field) => this.toSolutionDataModelField(field)),
      interfaces: type.node.interfaces?.map(
        (typeInterface) => typeInterface.name
      ),
      directives: this.mapDirectives(type.getDirectives()),
    } as DataModelTypeDefsType;
  }

  private toSolutionDataModelField(
    field: FieldDefinitionApi
  ): DataModelTypeDefsField {
    return {
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
}
