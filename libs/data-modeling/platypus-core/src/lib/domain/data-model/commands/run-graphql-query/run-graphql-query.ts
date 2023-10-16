import type { CogniteClient } from '@cognite/sdk';

import { PlatypusError, Query } from '../../../../boundaries/types';
import { Validator } from '../../../../boundaries/validation';
import { RequiredFieldValidator } from '../../../common/validators';
import { GraphQLQueryResponse, RunQueryDTO } from '../../dto/common-dtos';
import { FdmMixerApiService } from '../../providers/fdm-next';

export class RunGraphqlQuery implements Query<GraphQLQueryResponse> {
  constructor(private mixerApiService: FdmMixerApiService) {}

  static create(cdfClient: CogniteClient) {
    return new RunGraphqlQuery(new FdmMixerApiService(cdfClient));
  }

  /**
   * Run GraphQL query against a Data Model Version
   * @param dto
   */
  execute(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const validator = new Validator(dto);
    validator.addRule('dataModelId', new RequiredFieldValidator());
    const validationResult = validator.validate();

    if (!validationResult.valid) {
      return Promise.reject(validationResult.errors);
    }

    const reqDto: RunQueryDTO = {
      ...dto,
      extras: { ...dto.extras, apiName: dto.dataModelId },
    };

    return this.mixerApiService
      .runQuery(reqDto)
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }
}
