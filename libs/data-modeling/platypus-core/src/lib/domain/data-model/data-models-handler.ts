import { PlatypusError } from '../../boundaries/types';
import { Result } from '../../boundaries/types/result';
import { Validator } from '../../boundaries/validation';
import { RequiredFieldValidator } from '../common/validators/required-field.validator';

import { FlexibleDataModelingClient } from './boundaries';
import {
  CreateDataModelDTO,
  DeleteDataModelDTO,
  DeleteDataModelOutput,
  FetchDataModelDTO,
  FetchDataModelFromDMSDTO,
  UpdateDataModelDTO,
} from './dto';
import { DataModelsApiService } from './providers/fdm-next';
import { DataModelInstanceDTO } from './providers/fdm-next/dto/dms-data-model-dtos';
import { ListSpacesDTO } from './providers/fdm-next/dto/dms-space-dtos';
import { DataModel, DataModelVersion, SpaceDTO, SpaceInstance } from './types';

export class DataModelsHandler {
  constructor(
    private fdmClient: FlexibleDataModelingClient,
    private dataModelsApiService: DataModelsApiService
  ) {}

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

  /**
   * Fetch the versions of specified DataModel
   * @param dto
   * @returns
   */
  fetchVersions(dto: FetchDataModelDTO): Promise<Result<DataModelVersion[]>> {
    return this.fdmClient
      .listDataModelVersions({ externalId: dto.dataModelId, space: dto.space })
      .then((dataModels) => Result.ok(dataModels))
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

  async fetchDataModelFromDMS(
    dto: FetchDataModelFromDMSDTO
  ): Promise<Result<DataModelInstanceDTO>> {
    const { items: dataModelVersions } =
      // eslint-disable-next-line testing-library/no-await-sync-query
      await this.dataModelsApiService.getByIds({
        items: [
          {
            externalId: dto.dataModelId,
            space: dto.space,
            version: dto.version,
          },
        ],
      });

    if (dataModelVersions.length > 0) {
      return Result.ok(dataModelVersions[0]);
    }

    // TODO i18n and better message
    return Result.fail({
      name: 'Unable to find Data Model',
    });
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
  delete(
    dto: DeleteDataModelDTO,
    deleteViews: boolean
  ): Promise<Result<DeleteDataModelOutput>> {
    return this.fdmClient
      .deleteDataModel(dto, deleteViews)
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

  async getSpaces(dto?: ListSpacesDTO): Promise<Result<SpaceInstance[]>> {
    try {
      const spaces = await this.fdmClient.getSpaces(dto);

      return Result.ok(spaces);
    } catch (err) {
      if ((err as PlatypusError).code === 401) {
        return Result.fail({
          name: (err as PlatypusError).message,
        });
      }

      return Result.fail(err);
    }
  }

  async createSpace(dto: SpaceDTO): Promise<Result<SpaceInstance>> {
    try {
      const space = await this.fdmClient.createSpace(dto);
      return Result.ok(space);
    } catch (err) {
      if (
        (err as PlatypusError).code === 400 ||
        (err as PlatypusError).code === 409
      ) {
        return Result.fail({
          name: (err as PlatypusError).message,
        });
      }

      return Result.fail(err);
    }
  }
}
