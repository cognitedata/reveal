/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  DataModelTypeDefsTypeKind,
  IDataModelTypeDefsBuilderService,
  UpdateDataModelFieldDTO,
} from '@platypus/platypus-core';
import {
  FieldDefinitionNodeProps,
  ObjectTypeDefinitionNodeProps,
} from 'graphql-extra';

import { TypeDefsParserService } from './type-defs-parser-service';

export class GraphQLTypeDefsBuilderService
  extends TypeDefsParserService
  implements IDataModelTypeDefsBuilderService
{
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

    return this.dataModelTypeDefsMapper.toSolutionDataModelType(
      newType,
      typeNames
    );
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

    return this.dataModelTypeDefsMapper.toSolutionDataModelType(
      type,
      typeNames
    );
  }

  removeType(typeName: string): void {
    this.createIfEmpty();
    this.schemaAst!.removeType(typeName);
  }

  getType(typeName: string): DataModelTypeDefsType {
    const typeNames = this.getTypeNames();
    return this.dataModelTypeDefsMapper.toSolutionDataModelType(
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
    return this.dataModelTypeDefsMapper.toSolutionDataModelField(
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

    const updatedField = this.dataModelTypeDefsMapper.toSolutionDataModelField(
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
}
