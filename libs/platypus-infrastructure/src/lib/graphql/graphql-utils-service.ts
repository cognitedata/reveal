/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IGraphQlUtilsService } from '@platypus-core/domain/solution/boundaries';
import {
  DirectiveProps,
  SolutionDataModel,
  SolutionDataModelField,
  SolutionDataModelFieldArgument,
  SolutionDataModelType,
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

  addType(name: string, directive?: string): SolutionDataModelType {
    this.createIfEmpty();
    const newType = this.schemaAst!.createObjectType({
      name: name,
      directives: directive ? [directive] : [],
    });

    return this.toSolutionDataModelType(newType);
  }

  updateType(
    typeName: string,
    updates: Partial<SolutionDataModelType>
  ): SolutionDataModelType {
    this.createIfEmpty();

    const type = this.schemaAst!.getObjectType(typeName);
    if (updates.name && updates.name !== type.getName()) {
      type.setName(updates.name);
    }

    if (updates.description && updates.name !== type.getDescription()) {
      type.setDescription(updates.description);
    }

    if (updates.directives) {
      if (!updates.directives.length) {
        type.getDirectives().forEach((directive) => {
          type.removeDirective(directive.getName());
        });
      } else {
        updates.directives.forEach((directive) => {
          type.upsertDirective(directive);
        });
      }
    }

    return this.toSolutionDataModelType(type);
  }

  removeType(typeName: string): void {
    this.createIfEmpty();
    this.schemaAst!.removeType(typeName);
  }

  addField(
    typeName: string,
    fieldName: string,
    fieldProps: Partial<SolutionDataModelField>
  ): SolutionDataModelField {
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
  ): SolutionDataModelField {
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

  parseSchema(graphQlSchema: string): SolutionDataModel {
    this.schemaAst = documentApi().addSDL(graphQlSchema);

    const types = [...this.schemaAst.typeMap.keys()].map((type) =>
      this.schemaAst!.typeMap.get(type)
    );

    const mappedTypes: SolutionDataModelType[] = types.map((type) => {
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
    } as SolutionDataModel;
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

  private toSolutionDataModelType(type: ObjectTypeApi): SolutionDataModelType {
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
    } as SolutionDataModelType;
  }

  private toSolutionDataModelField(
    field: FieldDefinitionApi
  ): SolutionDataModelField {
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
    } as SolutionDataModelField;
  }

  private mapArguments(
    args: InputValueApi[]
  ): SolutionDataModelFieldArgument[] {
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
        } as SolutionDataModelFieldArgument)
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
