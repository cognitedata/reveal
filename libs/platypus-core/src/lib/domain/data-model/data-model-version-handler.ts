import { DTO, PlatypusError, Result } from '@platypus-core/boundaries/types';
import {
  Validator,
  ValidatorResult,
} from '@platypus-core/boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';
import { FlexibleDataModelingClient, IGraphQlUtilsService } from './boundaries';
import { mixerApiBuiltInTypes } from './constants';
import {
  ConflictMode,
  CreateDataModelVersionDTO,
  FetchDataModelVersionDTO,
  GraphQLQueryResponse,
  ListDataModelVersionsDTO,
  PublishDataModelVersionDTO,
  RunQueryDTO,
} from './dto';

import {
  DataModelValidationError,
  DataModelVersion,
  DataModelVersionStatus,
} from './types';

export class DataModelVersionHandler {
  constructor(
    private fdmClient: FlexibleDataModelingClient,
    private graphqlService: IGraphQlUtilsService
  ) {}

  /**
   * Fetch data model version
   * @param dto
   */
  version(dto: FetchDataModelVersionDTO): Promise<Result<DataModelVersion>> {
    const validationResult = this.validateField(dto, ['dataModelId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.fdmClient
      .fetchDataModelVersion(dto)
      .then((res) => Result.ok(res))
      .catch((error: PlatypusError) => Result.fail(error));
  }

  /**
   * List Data Model Versions
   * @param dto
   */
  versions(dto: ListDataModelVersionsDTO): Promise<Result<DataModelVersion[]>> {
    const validationResult = this.validateField(dto, ['dataModelId']);
    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.fdmClient
      .listDataModelVersions(dto)
      .then((res) => Result.ok(res))
      .catch((error) => Result.fail(error));
  }

  async validate(
    dto: CreateDataModelVersionDTO,
    validateBreakingChanges = true
  ): Promise<Result<DataModelValidationError[]>> {
    const errors = this.graphqlService.validate(
      dto.schema,
      mixerApiBuiltInTypes
    );

    if (errors.length) {
      return Promise.resolve(Result.fail(errors));
    }

    if (!validateBreakingChanges || !dto.externalId) {
      return Promise.resolve(Result.ok([]));
    }

    // if all ok til this point, the schema should be valid
    // we can check for breaking changes
    return this.fdmClient
      .validateDataModel(dto)
      .then((dataModelValidationErrors) => {
        return dataModelValidationErrors.length === 0
          ? Result.ok([])
          : Result.fail<DataModelValidationError[]>(dataModelValidationErrors);
      })
      .catch((error: PlatypusError) => Result.fail(error));
  }

  /**
   * Publish new schema by bumping the version.
   * @param dto - CreateDataModelVersionDTO
   * @param conflictMode - NEW_VERSION | PATCH
   */
  async publish(
    dto: CreateDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<Result<DataModelVersion>> {
    const validationResult = this.validateField(dto, ['externalId']);
    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    const publishDataModelVersionDto: PublishDataModelVersionDTO = {
      ...dto,
      space: dto.externalId,
      createdTime: dto.createdTime || Date.now(),
      lastUpdatedTime: dto.lastUpdatedTime || Date.now(),
      status: dto.status || DataModelVersionStatus.PUBLISHED,
      version: dto.version ?? '1',
    };

    // Validate Data Model
    const dataModelValidationResult = await this.validate(
      publishDataModelVersionDto,
      conflictMode === 'PATCH'
    );

    if (dataModelValidationResult.isFailure) {
      const error = PlatypusError.fromDataModelValidationError(
        dataModelValidationResult.errorValue()
      );

      return Result.fail(error);
    }

    return this.fdmClient
      .publishDataModelVersion(publishDataModelVersionDto, conflictMode)
      .then((dataModelVersion) => Result.ok(dataModelVersion))
      .catch((error: PlatypusError) => Result.fail(error));
  }

  /**
   * Run GraphQL query against a Data Model Version
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<Result<GraphQLQueryResponse>> {
    const validationResult = this.validateField(dto, ['dataModelId']);

    if (!validationResult.valid) {
      return Promise.reject(Result.fail(validationResult.errors));
    }

    return this.fdmClient
      .runQuery(dto)
      .then((response) => Result.ok(response))
      .catch((error: PlatypusError) => Promise.reject(error));
  }

  private validateField(dto: DTO, fields: string[]): ValidatorResult {
    const validator = new Validator(dto);
    fields.forEach((field) =>
      validator.addRule(field, new RequiredFieldValidator())
    );
    return validator.validate();
  }
}
