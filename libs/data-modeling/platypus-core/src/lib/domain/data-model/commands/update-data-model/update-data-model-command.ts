import type { CogniteClient } from '@cognite/sdk';

import { Command, PlatypusError } from '../../../../boundaries/types';
import { Validator } from '../../../../boundaries/validation';
import { RequiredFieldValidator } from '../../../common/validators';
import { FdmMixerApiService } from '../../providers/fdm-next';
import { DataModelDataMapper } from '../../providers/fdm-next/data-mappers';
import { DataModel } from '../../types';
import {
  DataModelDescriptionValidator,
  DataModelExternalIdValidator,
  DataModelNameValidator,
  SpaceIdValidator,
} from '../../validators';

import { UpdateDataModelDTO } from './dto';

export class UpdateDataModelCommand implements Command<DataModel> {
  private dataModelDataMapper: DataModelDataMapper;
  constructor(private mixerApiService: FdmMixerApiService) {
    this.dataModelDataMapper = new DataModelDataMapper();
  }

  static create(cdfClient: CogniteClient): UpdateDataModelCommand {
    const mixerApiService = new FdmMixerApiService(cdfClient);
    return new UpdateDataModelCommand(mixerApiService);
  }

  /**
   * Updates Data Model metadata (name, description...etc.)
   * @param dto CreateDataModelDTO
   */
  execute(dto: UpdateDataModelDTO): Promise<DataModel> {
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

    if (!dto.space) {
      throw 'space required to update data model with FDM V3';
    }

    if (!dto.version) {
      throw 'version required to update data model with FDM V3';
    }

    const upsertDto = {
      description: dto.description,
      externalId: dto.externalId,
      name: dto.name,
      space: dto.space,
      version: dto.version,
      graphQlDml: dto.graphQlDml,
    };

    return this.mixerApiService
      .upsertVersion(upsertDto)
      .then((dataModelResponse) => {
        if (dataModelResponse.errors?.length) {
          return Promise.reject(dataModelResponse.errors);
        } else {
          return Promise.resolve(
            this.dataModelDataMapper.deserialize(dataModelResponse.result)
          );
        }
      })
      .catch((err) => {
        if ((err as PlatypusError).code === 409) {
          return Promise.reject({
            name: 'Data Model with that name already exists.',
          });
        }

        return Promise.reject(err);
      });
  }
}
