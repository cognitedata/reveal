import { ValidationRule } from '../../../boundaries/validation';
import { UpdateDataModelFieldDTO } from '../dto';
import {
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  DataModelTypeDefsTypeKind,
  DataModelValidationError,
} from '../types';

export * from './fdm-client';

export interface IDataModelTypeDefsParserService {
  /**
   * Parse graphql schema string
   * and converts into SolutonDataModel
   * @param graphQlSchema
   */
  parseSchema(
    graphQlSchema: string,
    views?: { externalId: string; version: string }[],
    includeBuiltInTypes?: boolean
  ): DataModelTypeDefs;

  /**
   * Converts SolutonDataModel back into graphql SDL string
   * @param state
   */
  generateSdl(): string;

  /**
   * Set complete type object into AST
   * @param typeName
   * @param type
   */
  setType(typeName: string, type: DataModelTypeDefsType): void;

  /** Clears the state */
  clear(): void;
}

export interface IDataModelTypeDefsBuilderService
  extends IDataModelTypeDefsParserService {
  /**
   * Adds new type into AST
   * @param name
   */
  addType(
    name: string,
    kind?: DataModelTypeDefsTypeKind,
    directive?: string
  ): DataModelTypeDefsType;

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
}

export type GraphQlValidationResult = {
  valid: boolean;
  errors: DataModelValidationError[];
};
/**
 * Validates GraphQl Schema String
 *
 * Validation runs synchronously, returning an array of encountered errors, or
 * an empty array if no errors were encountered and the document is valid.
 *
 * This is just the abstraction to keep the core package clean without additional dependencies and side effects.
 * The actual implementation is in the platypus-common-utils package.
 * */
export interface IGraphQlSchemaValidator extends ValidationRule {
  validate(graphQlSchema: string): GraphQlValidationResult;
}
