import { PlatypusError } from '@platypus-core/boundaries/types';
import { Result } from '../../boundaries/types/result';
import { Validator } from '../../boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';
import { FlexibleDataModelingClient } from './boundaries';

import {
  CreateDataModelDTO,
  DeleteDataModelDTO,
  FetchDataModelDTO,
  UpdateDataModelDTO,
} from './dto';

import { DataModel } from './types';

export class DataModelsHandler {
  constructor(private fdmClient: FlexibleDataModelingClient) {}

  /**
   * Lists the available Data Models
   * @returns
   */
  list(): Promise<Result<DataModel[]>> {
    return this.fdmClient
      .listDataModels()
      .then((dataModels) => Result.ok(dataModels))
      .catch((err: PlatypusError) => Result.fail(err));
  }

  /**
   * Fetch the specified DataModel
   * @param dto
   * @returns
   */
  fetch(dto: FetchDataModelDTO): Promise<Result<DataModel>> {
    return this.fdmClient
      .fetchDataModel(dto)
      .then((dataModel) => Result.ok(dataModel))
      .catch((err: PlatypusError) => Result.fail(err));
  }

  async create(dto: CreateDataModelDTO): Promise<Result<DataModel>> {
    const validator = new Validator(dto);
    validator.addRule('name', new RequiredFieldValidator());
    const validationResult = validator.validate();

    if (!validationResult.valid) {
      return Promise.resolve(Result.fail(validationResult.errors));
    }

    try {
      const createdDataModel = await this.fdmClient.createDataModel(dto);

      return Result.ok(createdDataModel);
    } catch (err) {
      if ((err as PlatypusError).code === 409) {
        return Result.fail({
          name: 'Data Model with that name already exists.',
        });
      }

      return Result.fail(err);
    }
  }

  async update(dto: UpdateDataModelDTO): Promise<Result<DataModel>> {
    const validator = new Validator(dto);
    validator.addRule('name', new RequiredFieldValidator());
    const validationResult = validator.validate();

    if (!validationResult.valid) {
      return Promise.resolve(Result.fail(validationResult.errors));
    }

    try {
      const updatedDataModel = await this.fdmClient.updateDataModel(dto);

      return Result.ok(updatedDataModel);
    } catch (err) {
      if ((err as PlatypusError).code === 409) {
        return Result.fail({
          name: 'Data Model with that name already exists.',
        });
      }

      return Result.fail(err);
    }
  }

  /**
   * Deletes the specified Data Model including all versions
   * And the data related with it.
   */
  delete(dto: DeleteDataModelDTO): Promise<Result<unknown>> {
    return this.fdmClient
      .deleteDataModel(dto)
      .then((res) => Result.ok(res))
      .catch((err: PlatypusError) => {
        if (err.code === 403) {
          return Result.fail({
            name: 'Failed to delete the Data Model, insufficient access rights.',
          });
        }

        return Result.fail(err);
      });
  }
}
