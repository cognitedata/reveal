import {
  DataManagmentHandler,
  MixerApiQueryBuilderService,
  SolutionMixerApiFacadeService,
  SolutionsApiService,
  SolutionTemplatesFacadeService,
  TemplatesApiQueryBuilderService,
  TemplatesApiService,
} from '@platypus/platypus-core';
import config from '@platypus-app/config/config';
import { getCogniteSDKClient } from '../../../../environments/cogniteSdk';

export default () => {
  const solutionsApiService = config.USE_MIXER_API
    ? new SolutionMixerApiFacadeService(
        new SolutionsApiService(getCogniteSDKClient())
      )
    : new SolutionTemplatesFacadeService(
        new TemplatesApiService(getCogniteSDKClient())
      );

  const queryBuilder = config.USE_MIXER_API
    ? new MixerApiQueryBuilderService()
    : new TemplatesApiQueryBuilderService();

  return {
    dataManagmentHandler: new DataManagmentHandler(
      queryBuilder,
      solutionsApiService,
      config.USE_MIXER_API ? 'schema-service' : 'templates'
    ),
  };
};
