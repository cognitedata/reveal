import { Container, token } from 'brandi';

import {
  DataModelsHandler,
  DataModelVersionHandler,
  MixerApiService,
  DataModelTypeDefsBuilderService,
  DataModelStorageApiService,
  DateUtils,
  TimeUtils,
  StorageProviderFactory,
  DataManagmentHandler,
  MixerApiQueryBuilderService,
} from '@platypus/platypus-core';

import { DateUtilsImpl, TimeUtilsImpl } from '@platypus-app/utils/data';

import { StorageProviderFactoryImpl } from '@platypus-app/utils/persistence';

import { GraphQlUtilsService } from '@platypus/platypus-common-utils';

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
  mixerApiService: token<MixerApiService>('mixerApiService'),
  dataModelStorageApiService: token<DataModelStorageApiService>(
    'dataModelStorageApiService'
  ),
  dataModelTypeDefsBuilderService: token<DataModelTypeDefsBuilderService>(
    'dataModelTypeDefsBuilderService'
  ),
  dataManagmentHandler: token<DataManagmentHandler>('dataManagmentHandler'),
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
  .bind(TOKENS.mixerApiService)
  .toInstance(() => {
    const sdkClient = getCogniteSDKClient();
    return new MixerApiService(sdkClient);
  })
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelStorageApiService)
  .toInstance(() => {
    const sdkClient = getCogniteSDKClient();
    return new DataModelStorageApiService(sdkClient);
  })
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelsHandler)
  .toInstance(
    () =>
      new DataModelsHandler(
        rootInjector.get(TOKENS.mixerApiService),
        rootInjector.get(TOKENS.dataModelStorageApiService)
      )
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelVersionHandler)
  .toInstance(
    () =>
      new DataModelVersionHandler(
        rootInjector.get(TOKENS.mixerApiService),
        rootInjector.get(TOKENS.dataModelStorageApiService),
        new GraphQlUtilsService()
      )
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelTypeDefsBuilderService)
  .toInstance(
    () => new DataModelTypeDefsBuilderService(new GraphQlUtilsService())
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataManagmentHandler)
  .toInstance(
    () =>
      new DataManagmentHandler(
        new MixerApiQueryBuilderService(),
        rootInjector.get(TOKENS.mixerApiService)
      )
  )
  .inSingletonScope();
