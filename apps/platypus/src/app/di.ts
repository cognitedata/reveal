import {
  DataModelsHandler,
  DataModelVersionHandler,
  SolutionTemplatesFacadeService,
  TemplatesApiService,
  DataModelApiFacadeService,
  MixerApiService,
  SolutionDataModelService,
} from '@platypus/platypus-core';
import {
  DateUtilsImpl,
  GraphQlUtilsService,
  StorageProviderFactoryImpl,
  TimeUtilsImpl,
} from '@platypus/platypus-infrastructure';
import config from './config/config';
import { getCogniteSDKClient } from '../environments/cogniteSdk';

export default () => {
  const solutionsApiService = config.USE_MIXER_API
    ? new DataModelApiFacadeService(new MixerApiService(getCogniteSDKClient()))
    : new SolutionTemplatesFacadeService(
        new TemplatesApiService(getCogniteSDKClient())
      );
  return {
    dateUtils: new DateUtilsImpl(),
    timeUtils: new TimeUtilsImpl(),
    storageProviderFactory: new StorageProviderFactoryImpl(),
    solutionHandler: new DataModelsHandler(solutionsApiService),
    solutionSchemaHandler: new DataModelVersionHandler(solutionsApiService),
    solutionDataModelService: new SolutionDataModelService(
      new GraphQlUtilsService(),
      config.USE_MIXER_API ? 'schema-service' : 'templates'
    ),
  };
};
