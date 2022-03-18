import { IGraphQlUtilsService } from '../boundaries';
import { UpdateSolutionDataModelFieldDTO } from '../dto';
import {
  SolutionDataModelField,
  SolutionDataModel,
  SolutionDataModelType,
  BuiltInType,
} from '../types';
export class SolutionDataModelService {
  constructor(
    private graphqlService: IGraphQlUtilsService,
    private readonly backend: 'templates' | 'schema-service' = 'templates'
  ) {}

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
    let newState = state;
    state.types.forEach((type: SolutionDataModelType) => {
      type.fields.forEach((field: SolutionDataModelField) => {
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

  removeType(state: SolutionDataModel, typeName: string): SolutionDataModel {
    let newState = state;
    state.types.forEach((type: SolutionDataModelType) => {
      type.fields.forEach((field: SolutionDataModelField) => {
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

  getSupportedPrimitiveTypes(): Promise<BuiltInType[]> {
    // TODO: This should work depending on the BE
    // If schema team, load types and directives that are specific for them
    return Promise.resolve([
      { name: 'String', type: 'SCALAR' },
      { name: 'Int', type: 'SCALAR' },
      { name: 'Float', type: 'SCALAR' },
      { name: 'Boolean', type: 'SCALAR' },
      { name: 'ID', type: 'SCALAR' },
      { name: 'Long', type: 'SCALAR' },
      { name: 'TimeSeries', type: 'OBJECT' },
      { name: 'SyntheticTimeSeries', type: 'OBJECT' },
      { name: 'Sequence', type: 'OBJECT' },
      { name: 'File', type: 'OBJECT' },
      { name: 'Asset', type: 'OBJECT' },
      { name: 'Event', type: 'OBJECT' },
      { name: 'template', type: 'DIRECTIVE', fieldDirective: false },
    ] as BuiltInType[]);
  }

  /** Clears the state */
  clear() {
    this.graphqlService.clear();
  }
}
