import { IGraphQlUtilsService } from '../boundaries';
import { UpdateSolutionDataModelFieldDTO } from '../dto';
import {
  SolutionDataModelField,
  SolutionDataModel,
  SolutionDataModelType,
} from '../types';

export class SolutionDataModelService {
  constructor(private graphqlService: IGraphQlUtilsService) {}

  parseSchema(graphQlSchema: string): SolutionDataModel {
    return this.graphqlService.parseSchema(graphQlSchema);
  }

  buildSchemaString(): string {
    const schema = this.graphqlService.generateSdl();
    return schema;
  }

  addType(state: SolutionDataModel, name: string): SolutionDataModel {
    const newType = this.graphqlService.addType(name);
    return {
      ...state,
      types: [...state.types, newType],
    };
  }

  renameType(
    state: SolutionDataModel,
    oldTypeName: string,
    newTypeName: string
  ): SolutionDataModel {
    if (!state.types.filter((type) => type.name === newTypeName).length) {
      state.types.forEach((type: SolutionDataModelType) => {
        type.fields.forEach((field: SolutionDataModelField) => {
          if (field.type.name === oldTypeName) {
            this.updateField(state, type.name, field.name, {
              ...field,
              type: { ...field.type, name: newTypeName },
            });
          }
        });
      });

      const updatedType = this.graphqlService.updateType(oldTypeName, {
        name: newTypeName,
      });

      state.types = state.types.map((type) => {
        if (type.name === oldTypeName) {
          return updatedType;
        } else {
          return type;
        }
      });
    }

    return {
      ...state,
      types: state.types,
    };
  }

  removeType(state: SolutionDataModel, typeName: string): SolutionDataModel {
    state.types.forEach((type: SolutionDataModelType) => {
      type.fields.forEach((field: SolutionDataModelField) => {
        if (field.type.name === typeName) {
          this.removeField(state, type.name, field.name);
        }
      });
    });

    this.graphqlService.removeType(typeName);

    return {
      ...state,
      types: state.types.filter((type) => type.name !== typeName),
    };
  }

  addField(
    state: SolutionDataModel,
    typeName: string,
    fieldName: string,
    props: Partial<UpdateSolutionDataModelFieldDTO>
  ): SolutionDataModel {
    const newField = this.graphqlService.addField(typeName, fieldName, props);
    return {
      ...state,
      types: state.types.map((type: SolutionDataModelType) =>
        type.name === typeName
          ? { ...type, fields: [...type.fields, newField] }
          : type
      ),
    };
  }

  updateField(
    state: SolutionDataModel,
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateSolutionDataModelFieldDTO>
  ): SolutionDataModel {
    const updatedField = this.graphqlService.updateTypeField(
      typeName,
      fieldName,
      updates
    ) as SolutionDataModelField;

    return {
      ...state,
      types: state.types.map((type: SolutionDataModelType) =>
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
    state: SolutionDataModel,
    typeName: string,
    fieldName: string
  ): SolutionDataModel {
    this.graphqlService.removeField(typeName, fieldName);
    const newState = {
      ...state,
      types: state.types.map((type: SolutionDataModelType) =>
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

  getCustomTypesNames(state: SolutionDataModel): string[] {
    // this should be extended to filter types and get built in types as well
    return state.types.map((type) => type.name);
  }

  /** Clears the state */
  clear() {
    this.graphqlService.clear();
  }
}
