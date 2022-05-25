import {
  DataModelApiFacadeService,
  MixerApiService,
  DataModelVersionHandler,
  DataModelsHandler,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const getSchemaApiService = () => {
  const client = getCogniteSDKClient();
  return new MixerApiService(client);
};

export const getSolutionHandler = () => {
  return new DataModelsHandler(
    new DataModelApiFacadeService(getSchemaApiService())
  );
};

export const getSolutionSchemaHandler = () => {
  return new DataModelVersionHandler(
    new DataModelApiFacadeService(getSchemaApiService())
  );
};
