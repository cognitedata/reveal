import {
  SolutionMixerApiFacadeService,
  SolutionsApiService,
  SolutionSchemaHandler,
  SolutionsHandler,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const getSchemaApiService = () => {
  const client = getCogniteSDKClient();
  return new SolutionsApiService(client);
};

export const getSolutionHandler = () => {
  return new SolutionsHandler(
    new SolutionMixerApiFacadeService(getSchemaApiService())
  );
};

export const getSolutionSchemaHandler = () => {
  return new SolutionSchemaHandler(
    new SolutionMixerApiFacadeService(getSchemaApiService())
  );
};
