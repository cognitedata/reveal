import {
  SolutionsHandler,
  SolutionSchemaHandler,
  SolutionTemplatesFacadeService,
  TemplatesApiService,
  SolutionMixerApiFacadeService,
  SolutionsApiService,
} from '@platypus/platypus-core';
import {
  DateUtilsImpl,
  StorageProviderFactoryImpl,
  TimeUtilsImpl,
} from '@platypus/platypus-infrastructure';
import config from './config/config';
import { getCogniteSDKClient } from './utils/cogniteSdk';

export default () => {
  const solutionsApiService = config.USE_MIXER_API
    ? new SolutionMixerApiFacadeService(
        new SolutionsApiService(getCogniteSDKClient())
      )
    : new SolutionTemplatesFacadeService(
        new TemplatesApiService(getCogniteSDKClient())
      );
  return {
    dateUtils: new DateUtilsImpl(),
    timeUtils: new TimeUtilsImpl(),
    storageProviderFactory: new StorageProviderFactoryImpl(),
    solutionHandler: new SolutionsHandler(solutionsApiService),
    solutionSchemaHandler: new SolutionSchemaHandler(solutionsApiService),
  };
};
