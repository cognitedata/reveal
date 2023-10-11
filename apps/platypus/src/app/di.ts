import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  DataModelsHandler,
  DataModelVersionHandler,
  DataModelTypeDefsBuilderService,
  TransformationApiService,
  DateUtils,
  TimeUtils,
  StorageProviderFactory,
  DataManagementHandler,
  FdmClient,
  FlexibleDataModelingClient,
  SpacesApiService,
  FdmMixerApiService,
  ContainersApiService,
  ViewsApiService,
  DataModelsApiService,
  InstancesApiService,
} from '@platypus/platypus-core';
import { Container, token } from 'brandi';

import { getCogniteSDKClient } from '../environments/cogniteSdk';

import { DateUtilsImpl, TimeUtilsImpl } from './utils/data';
import { StorageProviderFactoryImpl } from './utils/persistence/storage-provider-factory.impl';

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
  dataModelsApiService: token<DataModelsApiService>('dataModelsApiService'),
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
    const sdkClient = getCogniteSDKClient();
    return new FdmClient(
      new SpacesApiService(sdkClient),
      new ContainersApiService(sdkClient),
      new ViewsApiService(sdkClient),
      new DataModelsApiService(sdkClient),
      new FdmMixerApiService(sdkClient),
      new GraphQlUtilsService(),
      new TransformationApiService(sdkClient),
      new InstancesApiService(sdkClient)
    );
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
  .bind(TOKENS.dataModelsHandler)
  .toInstance(() => {
    const sdkClient = getCogniteSDKClient();
    return new DataModelsHandler(
      rootInjector.get(TOKENS.fdmClient),
      new DataModelsApiService(sdkClient)
    );
  })
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
