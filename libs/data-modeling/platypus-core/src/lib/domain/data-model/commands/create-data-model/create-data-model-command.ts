import type { CogniteClient } from '@cognite/sdk';

import { Command, PlatypusError } from '../../../../boundaries/types';
import { DataUtils } from '../../../../boundaries/utils';
import { Validator } from '../../../../boundaries/validation';
import { RequiredFieldValidator } from '../../../common/validators';
import {
  FdmMixerApiService,
  SpaceDTO,
  SpaceInstanceDTO,
  SpacesApiService,
} from '../../providers/fdm-next';
import { DataModelDataMapper } from '../../providers/fdm-next/data-mappers';
import { DataModelDTO } from '../../providers/fdm-next/dto/dms-data-model-dtos';
import { DataModel } from '../../types';
import {
  DataModelDescriptionValidator,
  DataModelExternalIdValidator,
  DataModelNameValidator,
  SpaceIdValidator,
} from '../../validators';

import { CreateDataModelDTO } from './dto';

export class CreateDataModelCommand implements Command<DataModel> {
  private dataModelDataMapper: DataModelDataMapper;

  constructor(
    private mixerApiService: FdmMixerApiService,
    private spacesApi: SpacesApiService
  ) {
    this.dataModelDataMapper = new DataModelDataMapper();
  }

  static create(cdfClient: CogniteClient): CreateDataModelCommand {
    const mixerApiService = new FdmMixerApiService(cdfClient);
    const spacesApi = new SpacesApiService(cdfClient);
    return new CreateDataModelCommand(mixerApiService, spacesApi);
  }

  /**
   * Creates new Data Model
   * @param dto CreateDataModelDTO
   */
  async execute(dto: CreateDataModelDTO): Promise<DataModel> {
    const validator = new Validator(dto);
    validator.addRule('name', new RequiredFieldValidator());
    validator.addRule('name', new DataModelNameValidator());
    if (dto.externalId) {
      validator.addRule('externalId', new DataModelExternalIdValidator());
    }
    if (dto.space) {
      validator.addRule('space', new SpaceIdValidator());
    }
    if (dto.description) {
      validator.addRule('description', new DataModelDescriptionValidator());
    }

    const validationResult = validator.validate();

    if (!validationResult.valid) {
      return Promise.reject(validationResult.errors);
    }

    try {
      const dataModelDto: DataModelDTO = {
        space: dto.space || DataUtils.convertToExternalId(dto.name),
        externalId: dto.externalId || DataUtils.convertToExternalId(dto.name),
        name: dto.name,
        description: dto.description,
        version: '1',
        ...(dto.graphQlDml && { graphQlDml: dto.graphQlDml }),
      };

      return this.mixerApiService
        .getDataModelVersionsById(dataModelDto.space, dataModelDto.externalId)
        .then((results) => {
          if (results.length) {
            return Promise.reject(
              new PlatypusError(
                `Could not create data model. Data model with external-id ${dataModelDto.externalId} already exists in space ${dataModelDto.space}`,
                'UNKNOWN'
              )
            );
          }

          return this.createSpace({
            space: dataModelDto.space,
          });
        })
        .then(() => this.mixerApiService.upsertVersion(dataModelDto))
        .then((dataModelResponse) => {
          if (dataModelResponse.errors?.length) {
            return Promise.reject(dataModelResponse.errors);
          } else {
            return Promise.resolve(
              this.dataModelDataMapper.deserialize(dataModelResponse.result)
            );
          }
        });
    } catch (err) {
      if ((err as PlatypusError).code === 409) {
        return Promise.reject({
          name: 'Data Model with that name already exists.',
        });
      }

      return Promise.reject(err);
    }
  }

  /**
   * Creates a new space for data models.
   * @param dto
   */
  private createSpace(dto: SpaceDTO): Promise<SpaceInstanceDTO> {
    return this.spacesApi.upsert([dto]).then((res) => res.items[0]);
  }
}
