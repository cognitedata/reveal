import {
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';

import { getCogniteSDKClient } from '@platypus-app/utils/cogniteSdk';

export default () => {
  return {
    solutionsHandler: new SolutionsHandler(
      new SolutionsTemplatesApiService(getCogniteSDKClient())
    ),
  };
};
