import { PlatypusError } from '@platypus-core/boundaries/types';
import { Result } from '../../boundaries/types/result';
import { Validator } from '../../boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';
import { IDataModelsApiService } from './boundaries';
import {
  CreateDataModelDTO,
  DeleteDataModelDTO,
  FetchDataModelDTO,
} from './dto';
import { DataModel } from './types';

export class DataModelsHandler {
  constructor(private dataModelsApiService: IDataModelsApiService) {}

  list(): Promise<Result<DataModel[]>> {
    return this.dataModelsApiService
      .list()
      .then((solutions) => Result.ok(solutions))
      .catch((err: PlatypusError) => Result.fail(err));
  }

  fetch(dto: FetchDataModelDTO): Promise<Result<DataModel>> {
    return this.dataModelsApiService
      .fetch(dto)
      .then((solutions) => Result.ok(solutions));
  }

  create(dto: CreateDataModelDTO): Promise<Result<DataModel>> {
    const validator = new Validator(dto);
    validator.addRule('name', new RequiredFieldValidator());
    const validationResult = validator.validate();

    if (!validationResult.valid) {
      return Promise.resolve(Result.fail(validationResult.errors));
    }
    return this.dataModelsApiService
      .create(dto)
      .then((solution: DataModel) => Result.ok(solution))
      .catch((err: PlatypusError) => {
        if (err.code === 409) {
          return Result.fail({
            name: 'Solution name already exists.',
          });
        }

        return Result.fail(err);
      });
  }

  delete(dto: DeleteDataModelDTO): Promise<Result<unknown>> {
    return this.dataModelsApiService
      .delete(dto)
      .then((res) => Result.ok(res))
      .catch((err: PlatypusError) => {
        if (err.code === 403) {
          return Result.fail({
            name: 'Failed to delete the solution, insufficient access rights.',
          });
        }

        return Result.fail(err);
      });
  }
}
