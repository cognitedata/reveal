import { IGraphQlUtilsService } from '../boundaries';
import { mixerApiBuiltInTypes, templatesBiltInTypes } from '../constants';
import { UpdateSolutionDataModelFieldDTO } from '../dto';
import {
  DataModelTypeDefsField,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  BuiltInType,
} from '../types';
export class SolutionDataModelService {
  constructor(
    private graphqlService: IGraphQlUtilsService,
    private backend: 'templates' | 'schema-service' = 'templates'
  ) {}

  parseSchema(graphQlSchema: string): DataModelTypeDefs {
    return this.graphqlService.parseSchema(graphQlSchema);
  }

  buildSchemaString(): string {
    const schema = this.graphqlService.generateSdl();
    return schema;
  }

  addType(
    state: DataModelTypeDefs,
    name: string,
    directive?: string
  ): DataModelTypeDefs {
    const newType = this.graphqlService.addType(name, directive);
    let newState = {
      ...state,
      types: [...state.types, newType],
    };
    newState = this.addField(newState, name, '', {
      name: '',
      type: 'String',
    });
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

    const updatedType = this.graphqlService.updateType(oldTypeName, {
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

    this.graphqlService.removeType(typeName);

    return {
      ...newState,
      types: newState.types.filter((type) => type.name !== typeName),
    };
  }

  addField(
    state: DataModelTypeDefs,
    typeName: string,
    fieldName: string,
    props: Partial<UpdateSolutionDataModelFieldDTO>
  ): DataModelTypeDefs {
    const newField = this.graphqlService.addField(typeName, fieldName, props);
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
    updates: Partial<UpdateSolutionDataModelFieldDTO>
  ): DataModelTypeDefs {
    const updatedField = this.graphqlService.updateTypeField(
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
    this.graphqlService.removeField(typeName, fieldName);
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
    return this.backend === 'templates'
      ? templatesBiltInTypes
      : mixerApiBuiltInTypes;
  }

  /** Clears the state */
  clear() {
    this.graphqlService.clear();
  }
}
