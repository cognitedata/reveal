import { UpdateDataModelFieldDTO } from '../dto';
import {
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  DataModelValidationError,
} from '../types';

export interface IGraphQlUtilsService {
  /**
   * Parse graphql schema string
   * and converts into SolutonDataModel
   * @param graphQlSchema
   */
  parseSchema(graphQlSchema: string): DataModelTypeDefs;

  /**
   * Converts SolutonDataModel back into graphql SDL string
   * @param state
   */
  generateSdl(): string;

  /**
   * Adds new type into AST
   * @param name
   */
  addType(name: string, directive?: string): DataModelTypeDefsType;

  /**
   * Update specified type in AST
   */
  updateType(
    typeName: string,
    updates: Partial<DataModelTypeDefsType>
  ): DataModelTypeDefsType;

  /**
   * Removes specified type from AST
   * @param typeName
   */
  removeType(typeName: string): void;

  /**
   * Adds new field for the specified type into AST
   * @param typeName
   * @param fieldName
   * @param fieldProps
   */
  addField(
    typeName: string,
    fieldName: string,
    fieldProps: Partial<UpdateDataModelFieldDTO>
  ): DataModelTypeDefsField;

  /**
   * Updates the field for the specified type into AST
   * @param typeName
   * @param fieldName
   * @param updates
   */
  updateTypeField(
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateDataModelFieldDTO>
  ): DataModelTypeDefsField;

  /**
   * Removes field from specified type from AST
   * @param typeName
   * @param fieldName
   */
  removeField(typeName: string, fieldName: string): void;

  /** Clears the state */
  clear(): void;

  /**
   * Validates GraphQl Schema String
   *
   * Validation runs synchronously, returning an array of encountered errors, or
   * an empty array if no errors were encountered and the document is valid. */
  validate(graphQlString: string): DataModelValidationError[];
}
