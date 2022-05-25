import {
  SolutionMixerApiFacadeService,
  SolutionsApiService,
  DataModelVersionHandler,
  DataModelsHandler,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const getSchemaApiService = () => {
  const client = getCogniteSDKClient();
  return new SolutionsApiService(client);
};

export const getSolutionHandler = () => {
  return new DataModelsHandler(
    new SolutionMixerApiFacadeService(getSchemaApiService())
  );
};

export const getSolutionSchemaHandler = () => {
  return new DataModelVersionHandler(
    new SolutionMixerApiFacadeService(getSchemaApiService())
  );
};
