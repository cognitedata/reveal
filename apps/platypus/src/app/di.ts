import {
  GraphQLTypeDefsBuilderService,
  GraphQlSchemaValidator,
} from '@platypus/platypus-common-utils';
import {
  CreateDataModelCommand,
  CreateSpaceCommand,
  DataManagementHandler,
  DataModelTypeDefsHandler,
  DataModelVersionHandler,
  DataModelsApiService,
  DateUtils,
  DeleteDataModelCommand,
  DeleteInstancesCommand,
  FdmClient,
  FdmMixerApiService,
  FetchDataModelQuery,
  FetchDataModelVersionsQuery,
  FlexibleDataModelingClient,
  InstancesApiService,
  ListDataModelsQuery,
  ListSpacesQuery,
  RunGraphqlQuery,
  StorageProviderFactory,
  TimeUtils,
  TransformationApiService,
  UpdateDataModelCommand,
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
  dataModelVersionHandler: token<DataModelVersionHandler>(
    'dataModelVersionHandler'
  ),
  dataModelsApiService: token<DataModelsApiService>('dataModelsApiService'),
  dataModelTypeDefsBuilderService: token<DataModelTypeDefsHandler>(
    'dataModelTypeDefsBuilderService'
  ),
  DataManagementHandler: token<DataManagementHandler>('DataManagementHandler'),
  transformationsApiService: token<TransformationApiService>(
    'transformationsApiService'
  ),
  fdmClient: token<FlexibleDataModelingClient>('fdmClient'),
  listDataModelsQuery: token<ListDataModelsQuery>('listDataModelsQuery'),
  fetchDataModelQuery: token<FetchDataModelQuery>('fetchDataModelQuery'),
  fetchDataModelVersionsQuery: token<FetchDataModelVersionsQuery>(
    'fetchDataModelVersionsQuery'
  ),
  createDataModelCommand: token<CreateDataModelCommand>(
    'createDataModelCommand'
  ),
  updateDataModelCommand: token<UpdateDataModelCommand>(
    'updateDataModelCommand'
  ),
  deleteDataModelCommand: token<DeleteDataModelCommand>(
    'deleteDataModelCommand'
  ),
  createSpaceCommand: token<CreateSpaceCommand>('createSpaceCommand'),
  listSpacesQuery: token<ListSpacesQuery>('listSpacesQuery'),
  runGraphQlQuery: token<RunGraphqlQuery>('runGraphQlQuery'),
  deleteInstancesCommand: token<DeleteInstancesCommand>(
    'deleteInstancesCommand'
  ),
};

export const rootInjector = new Container();

// then register the dependencies
rootInjector
  .bind(TOKENS.fdmClient)
  .toInstance(() => {
    const sdkClient = getCogniteSDKClient();
    return new FdmClient(
      new FdmMixerApiService(sdkClient),
      new TransformationApiService(sdkClient),
      new InstancesApiService(sdkClient),
      new GraphQlSchemaValidator()
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
  .bind(TOKENS.dataModelVersionHandler)
  .toInstance(
    () => new DataModelVersionHandler(rootInjector.get(TOKENS.fdmClient))
  )
  .inSingletonScope();

rootInjector
  .bind(TOKENS.dataModelTypeDefsBuilderService)
  .toInstance(
    () =>
      new DataModelTypeDefsHandler(
        new GraphQLTypeDefsBuilderService(),
        new GraphQlSchemaValidator()
      )
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

rootInjector
  .bind(TOKENS.listDataModelsQuery)
  .toInstance(() => ListDataModelsQuery.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.fetchDataModelQuery)
  .toInstance(() => FetchDataModelQuery.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.fetchDataModelVersionsQuery)
  .toInstance(() => FetchDataModelVersionsQuery.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.createDataModelCommand)
  .toInstance(() => CreateDataModelCommand.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.updateDataModelCommand)
  .toInstance(() => UpdateDataModelCommand.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.deleteDataModelCommand)
  .toInstance(() => DeleteDataModelCommand.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.listSpacesQuery)
  .toInstance(() => ListSpacesQuery.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.createSpaceCommand)
  .toInstance(() => CreateSpaceCommand.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.runGraphQlQuery)
  .toInstance(() => RunGraphqlQuery.create(getCogniteSDKClient()))
  .inResolutionScope();

rootInjector
  .bind(TOKENS.deleteInstancesCommand)
  .toInstance(() => DeleteInstancesCommand.create(getCogniteSDKClient()))
  .inResolutionScope();
