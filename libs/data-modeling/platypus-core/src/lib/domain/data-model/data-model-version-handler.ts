import { DTO, PlatypusError, Result } from '../../boundaries/types';
import { Validator, ValidatorResult } from '../../boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';

import { FlexibleDataModelingClient } from './boundaries';
import { mixerApiBuiltInTypes } from './constants';
import {
  ConflictMode,
  CreateDataModelVersionDTO,
  PublishDataModelVersionDTO,
} from './dto';
import {
  DataModelValidationError,
  DataModelVersion,
  DataModelVersionStatus,
} from './types';

export class DataModelVersionHandler {
  constructor(private fdmClient: FlexibleDataModelingClient) {}

  async validate(
    dto: CreateDataModelVersionDTO,
    validateBreakingChanges = true
  ): Promise<Result<DataModelValidationError[]>> {
    const errors = this.fdmClient.validateGraphql(
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
      .validateDataModel(dto as PublishDataModelVersionDTO)
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
      space: dto.space || dto.externalId,
      createdTime: dto.createdTime || Date.now(),
      lastUpdatedTime: dto.lastUpdatedTime || Date.now(),
      status: dto.status || DataModelVersionStatus.PUBLISHED,
      version: dto.version ?? '1',
      previousVersion: dto.previousVersion,
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

  private validateField(dto: DTO, fields: string[]): ValidatorResult {
    const validator = new Validator(dto);
    fields.forEach((field) =>
      validator.addRule(field, new RequiredFieldValidator())
    );
    return validator.validate();
  }
}