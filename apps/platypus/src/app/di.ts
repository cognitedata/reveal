import {
  SolutionsHandler,
  SolutionSchemaHandler,
  SolutionTemplatesFacadeService,
  TemplatesApiService,
} from '@platypus/platypus-core';
import {
  DateUtilsImpl,
  StorageProviderFactoryImpl,
  TimeUtilsImpl,
} from '@platypus/platypus-infrastructure';
import { getCogniteSDKClient } from './utils/cogniteSdk';

export default () => {
  return {
    dateUtils: new DateUtilsImpl(),
    timeUtils: new TimeUtilsImpl(),
    storageProviderFactory: new StorageProviderFactoryImpl(),
    solutionHandler: new SolutionsHandler(
      new SolutionTemplatesFacadeService(
        new TemplatesApiService(getCogniteSDKClient())
      )
    ),
    solutionSchemaHandler: new SolutionSchemaHandler(
      new SolutionTemplatesFacadeService(
        new TemplatesApiService(getCogniteSDKClient())
      )
    ),
  };
};
