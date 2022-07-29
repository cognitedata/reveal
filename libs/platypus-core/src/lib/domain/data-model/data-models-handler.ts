import { PlatypusError } from '@platypus-core/boundaries/types';
import { DataUtils } from '@platypus-core/boundaries/utils';
import { Result } from '../../boundaries/types/result';
import { Validator } from '../../boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';

import {
  CreateDataModelDTO,
  DataModelApiOutputDTO,
  DeleteDataModelDTO,
  FetchDataModelDTO,
} from './dto';
import { DataModelStorageApiService, MixerApiService } from './services';
import { DataModelDataMapper } from './services/data-mappers/data-model-data-mapper';
import { DataModel } from './types';

export class DataModelsHandler {
  private dataModelDataMapper: DataModelDataMapper;

  constructor(
    private mixerApiService: MixerApiService,
    private dmsApiService: DataModelStorageApiService
  ) {
    // Internal services, no need to export to the outside world
    this.dataModelDataMapper = new DataModelDataMapper();
  }

  /**
   * Lists the available Data Models
   * @returns
   */
  list(): Promise<Result<DataModel[]>> {
    return this.mixerApiService
      .listApis()
      .then((results: DataModelApiOutputDTO[]) => {
        return results.map((result) =>
          this.dataModelDataMapper.deserialize(result)
        );
      })
      .then((dataModels) => Result.ok(dataModels))
      .catch((err: PlatypusError) => Result.fail(err));
  }

  /**
   * Fetch the specified DataModel
   * @param dto
   * @returns
   */
  fetch(dto: FetchDataModelDTO): Promise<Result<DataModel>> {
    return this.mixerApiService
      .getApisByIds(dto.dataModelId, false)
      .then((results) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.dataModelId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }
        return this.dataModelDataMapper.deserialize(results[0]);
      })
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

    const externalId = dto.externalId
      ? DataUtils.convertToCamelCase(dto.externalId)
      : DataUtils.convertToCamelCase(dto.name);

    try {
      const createApiResponse = await this.mixerApiService.upsertApi({
        externalId,
        description: dto.description || '',
        name: dto.name,
        metadata: dto.metadata || {},
      });

      await this.dmsApiService.applySpaces([{ externalId }]);

      const createdDataModel =
        this.dataModelDataMapper.deserialize(createApiResponse);

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

  /**
   * Deletes the specified Data Model including all versions
   * And the data related with it.
   */
  delete(dto: DeleteDataModelDTO): Promise<Result<unknown>> {
    return this.mixerApiService
      .deleteApi(dto.id)
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
