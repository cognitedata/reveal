import {
  IGraphQlSchemaValidator,
  IDataModelTypeDefsBuilderService,
} from './boundaries';
import { mixerApiBuiltInTypes } from './constants';
import { UpdateDataModelFieldDTO } from './dto';
import {
  DataModelTypeDefsField,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  BuiltInType,
  DataModelTypeDefsTypeKind,
} from './types';
export class DataModelTypeDefsHandler {
  constructor(
    private typeDefsBuilder: IDataModelTypeDefsBuilderService,
    private graphQlSchemaValidator: IGraphQlSchemaValidator
  ) {}

  parseSchema(
    graphQlSchema: string,
    views: { externalId: string; version: string }[]
  ): DataModelTypeDefs {
    return this.typeDefsBuilder.parseSchema(graphQlSchema, views);
  }

  buildSchemaString(): string {
    const schema = this.typeDefsBuilder.generateSdl();
    return schema;
  }

  addType(
    state: DataModelTypeDefs,
    name: string,
    kind: DataModelTypeDefsTypeKind,
    directive?: string
  ): DataModelTypeDefs {
    const newType = this.typeDefsBuilder.addType(name, kind, directive);
    const newState = {
      ...state,
      types: [...state.types, newType],
    };
    return newState;
  }

  renameType(
    state: DataModelTypeDefs,
    oldTypeName: string,
    newTypeName: string
  ): DataModelTypeDefs {
    let newState = state;
    state.types.forEach((type: DataModelTypeDefsType) => {
      type.fields.forEach((field: DataModelTypeDefsField) => {
        if (field.type.name === oldTypeName) {
          newState = this.updateField(newState, type.name, field.name, {
            ...field,
            type: { ...field.type, name: newTypeName },
          });
        }
      });
    });

    const updatedType = this.typeDefsBuilder.updateType(oldTypeName, {
      name: newTypeName,
    });

    return {
      ...newState,
      types: newState.types.map((type) => {
        if (type.name === oldTypeName) {
          return updatedType;
        } else {
          return type;
        }
      }),
    };
  }

  removeType(state: DataModelTypeDefs, typeName: string): DataModelTypeDefs {
    let newState = state;
    state.types.forEach((type: DataModelTypeDefsType) => {
      type.fields.forEach((field: DataModelTypeDefsField) => {
        if (field.type.name === typeName) {
          newState = this.removeField(state, type.name, field.name);
        }
      });
    });

    this.typeDefsBuilder.removeType(typeName);

    return {
      ...newState,
      types: newState.types.filter((type) => type.name !== typeName),
    };
  }

  addField(
    state: DataModelTypeDefs,
    typeName: string,
    fieldName: string,
    props: Partial<UpdateDataModelFieldDTO>
  ): DataModelTypeDefs {
    if (
      state.types
        .find((type) => type.name === typeName)
        ?.fields.some((field) => field.name === fieldName)
    ) {
      return this.updateField(state, typeName, fieldName, props);
    }
    const newField = this.typeDefsBuilder.addField(typeName, fieldName, props);
    return {
      ...state,
      types: state.types.map((type: DataModelTypeDefsType) =>
        type.name === typeName
          ? { ...type, fields: [...type.fields, newField] }
          : type
      ),
    };
  }

  updateField(
    state: DataModelTypeDefs,
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateDataModelFieldDTO>
  ): DataModelTypeDefs {
    const updatedField = this.typeDefsBuilder.updateTypeField(
      typeName,
      fieldName,
      updates
    ) as DataModelTypeDefsField;

    return {
      ...state,
      types: state.types.map((type: DataModelTypeDefsType) =>
        type.name === typeName
          ? {
              ...type,
              fields: type.fields.map((field) =>
                field.name === fieldName ? updatedField : field
              ),
            }
          : type
      ),
    };
  }

  removeField(
    state: DataModelTypeDefs,
    typeName: string,
    fieldName: string
  ): DataModelTypeDefs {
    this.typeDefsBuilder.removeField(typeName, fieldName);
    const newState = {
      ...state,
      types: state.types.map((type: DataModelTypeDefsType) =>
        type.name === typeName
          ? {
              ...type,
              fields: type.fields.filter((field) => field.name !== fieldName),
            }
          : type
      ),
    };

    return newState;
  }

  getCustomTypesNames(state: DataModelTypeDefs): string[] {
    // this should be extended to filter types and get built in types as well
    return state.types.map((type) => type.name);
  }

  getBuiltinTypes(): BuiltInType[] {
    return mixerApiBuiltInTypes;
  }

  /** Clears the state */
  clear() {
    this.typeDefsBuilder.clear();
  }

  /** Validates Data Model GraphQL.
   * Checks for sytax errors, unsupported features, breaking changes */
  validate(graphQlString: string) {
    return this.graphQlSchemaValidator.validate(graphQlString).errors;
  }
}
