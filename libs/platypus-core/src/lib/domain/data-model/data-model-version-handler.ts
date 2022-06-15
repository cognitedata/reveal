import { DTO, Result } from '@platypus-core/boundaries/types';
import {
  Validator,
  ValidatorResult,
} from '@platypus-core/boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';
import { IDataModelVersionApiService } from './boundaries';
import {
  ConflictMode,
  CreateDataModelVersionDTO,
  FetchDataModelDTO,
  GraphQLQueryResponse,
  ListVersionsDTO,
  RunQueryDTO,
} from './dto';
import { DataModelVersion } from './types';

export class DataModelVersionHandler {
  constructor(private dataModelsApiService: IDataModelVersionApiService) {}

  /**
   * Fetch data model (template group) schema
   * @param dto
   */
  version(dto: FetchDataModelDTO): Promise<Result<DataModelVersion>> {
    const validationResult = this.validate(dto, ['dataModelId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.dataModelsApiService
      .fetchVersion(dto)
      .then((dataModel: DataModelVersion) =>
        Result.ok(dataModel as DataModelVersion)
      );
  }

  /**
   * List Solution schema (template groups) versions
   * @param dto
   */
  versions(dto: ListVersionsDTO): Promise<Result<DataModelVersion[]>> {
    const validationResult = this.validate(dto, ['dataModelId']);
    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.dataModelsApiService
      .listVersions(dto)
      .then((versions) => Result.ok(versions));
  }

  /**
   * Publish new schema by bumping the version.
   * @param dataModelVersion - DataModelVersion
   * @param conflictMode - NEW_VERSION | PATCH
   */
  publish(
    dto: CreateDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<Result<DataModelVersion>> {
    const validationResult = this.validate(dto, ['externalId']);
    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.dataModelsApiService
      .publishVersion(dto, conflictMode)
      .then((version) => Result.ok(version))
      .catch((err) => Result.fail(err));
  }

  /**
   * Run query against a schema
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<Result<GraphQLQueryResponse>> {
    const validationResult = this.validate(dto, ['dataModelId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.dataModelsApiService
      .runQuery(dto)
      .then((response) => Result.ok(response));
  }

  private validate(dto: DTO, fields: string[]): ValidatorResult {
    const validator = new Validator(dto);
    fields.forEach((field) =>
      validator.addRule(field, new RequiredFieldValidator())
    );
    return validator.validate();
  }
}
