import config from '@platypus-app/config/config';
import { SolutionDataModelService } from '@platypus/platypus-core';
import { GraphQlUtilsService } from '@platypus/platypus-infrastructure';

export default {
  solutionDataModelService: new SolutionDataModelService(
    new GraphQlUtilsService(),
    config.USE_MIXER_API ? 'schema-service' : 'templates'
  ),
};
