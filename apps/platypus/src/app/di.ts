import { Container, token } from 'brandi';

import {
  MixerApiService,
  DmsApiService,
  DataModelsHandler,
  DataModelVersionHandler,
  DataModelTypeDefsBuilderService,
  TransformationApiService,
  DateUtils,
  TimeUtils,
  StorageProviderFactory,
  DataManagementHandler,
  FdmV2Client,
  FdmClient,
  StorageProviderType,
  FlexibleDataModelingClient,
  SpacesApiService,
  FdmMixerApiService,
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
  dataModelStorageApiService: token<DmsApiService>(
    'dataModelStorageApiService'
  ),
  dataModelTypeDefsBuilderService: token<DataModelTypeDefsBuilderService>(
    'dataModelTypeDefsBuilderService'
  ),
  DataManagementHandler: token<DataManagementHandler>('DataManagementHandler'),
  transformationsApiService: token<TransformationApiService>(
    'transformationsApiService'
  ),
  fdmClient: token<FlexibleDataModelingClient>('fdmClient'),
};

export const rootInjector = new Container();

// then register the dependencies

rootInjector
  .bind(TOKENS.fdmClient)
  .toInstance(() => {
    const localStorageProvider = rootInjector
      .get(TOKENS.storageProviderFactory)
      .getProvider(StorageProviderType.localStorage);

    const sdkClient = getCogniteSDKClient();

    if (localStorageProvider.getItem('USE_FDM_V3')) {
      return new FdmClient(
        new SpacesApiService(sdkClient),
        new FdmMixerApiService(sdkClient),
        new GraphQlUtilsService()
      );
    } else {
      return new FdmV2Client(
        new MixerApiService(sdkClient),
        new DmsApiService(sdkClient),
        new TransformationApiService(sdkClient),
        new GraphQlUtilsService()
      );
    }
  })
  .inSingletonScope();

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
    return new DmsApiService(sdkClient);
  })
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelsHandler)
  .toInstance(() => new DataModelsHandler(rootInjector.get(TOKENS.fdmClient)))
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelVersionHandler)
  .toInstance(
    () =>
      new DataModelVersionHandler(
        rootInjector.get(TOKENS.fdmClient),
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
  .bind(TOKENS.DataManagementHandler)
  .toInstance(
    () => new DataManagementHandler(rootInjector.get(TOKENS.fdmClient))
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.transformationsApiService)
  .toInstance(() => new TransformationApiService(getCogniteSDKClient()))
  .inSingletonScope();
