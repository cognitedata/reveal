import { Container, token } from 'brandi';

import {
  DataModelsHandler,
  DataModelVersionHandler,
  SolutionTemplatesFacadeService,
  TemplatesApiService,
  DataModelApiFacadeService,
  MixerApiService,
  DataModelService,
  DataModelStorageApiService,
  DateUtils,
  TimeUtils,
  StorageProviderFactory,
  DataManagmentHandler,
  MixerApiQueryBuilderService,
  TemplatesApiQueryBuilderService,
} from '@platypus/platypus-core';

import { DateUtilsImpl, TimeUtilsImpl } from '@platypus-app/utils/data';

import { StorageProviderFactoryImpl } from '@platypus-app/utils/persistence';

import { GraphQlUtilsService } from '@platypus/platypus-common-utils';

import config from './config/config';
import { getCogniteSDKClient } from '../environments/cogniteSdk';

// First define the Tokens
export const TOKENS = {
  dateUtils: token<DateUtils>('dateUtils'),
  timeUtils: token<TimeUtils>('timeUtils'),
  storageProviderFactory: token<StorageProviderFactory>(
    'storageProviderFactory'
  ),
  dataModelsHandler: token<DataModelsHandler>('dataModelsHandler'),
  dataModelVersionHandler: token<DataModelVersionHandler>(
    'dataModelVersionHandler'
  ),
  dataModelService: token<DataModelService>('dataModelService'),
  dataManagmentHandler: token<DataManagmentHandler>('dataManagmentHandler'),
  dataModelsApiService: token('dataModelsApiService'),
};

export const rootInjector = new Container();

// then register the dependencies
rootInjector
  .bind(TOKENS.dateUtils)
  .toInstance(DateUtilsImpl)
  .inSingletonScope();

rootInjector
  .bind(TOKENS.timeUtils)
  .toInstance(TimeUtilsImpl)
  .inSingletonScope();

rootInjector
  .bind(TOKENS.storageProviderFactory)
  .toInstance(StorageProviderFactoryImpl)
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelsApiService)
  .toInstance(() => {
    const sdkClient = getCogniteSDKClient();
    const solutionsApiService = config.USE_MIXER_API
      ? new DataModelApiFacadeService(
          new MixerApiService(sdkClient),
          new DataModelStorageApiService(sdkClient),
          new GraphQlUtilsService()
        )
      : new SolutionTemplatesFacadeService(new TemplatesApiService(sdkClient));

    // TODO: provide proper types here
    return solutionsApiService as any;
  })
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelsHandler)
  .toInstance(
    () =>
      new DataModelsHandler(
        rootInjector.get(TOKENS.dataModelsApiService as any)
      )
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelVersionHandler)
  .toInstance(
    () =>
      new DataModelVersionHandler(
        rootInjector.get(TOKENS.dataModelsApiService as any)
      )
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelService)
  .toInstance(
    () =>
      new DataModelService(
        new GraphQlUtilsService(),
        config.USE_MIXER_API ? 'schema-service' : 'templates'
      )
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataManagmentHandler)
  .toInstance(() => {
    const queryBuilder = config.USE_MIXER_API
      ? new MixerApiQueryBuilderService()
      : new TemplatesApiQueryBuilderService();

    return new DataManagmentHandler(
      queryBuilder,
      rootInjector.get(TOKENS.dataModelsApiService as any),
      config.USE_MIXER_API ? 'schema-service' : 'templates'
    );
  })
  .inSingletonScope();
