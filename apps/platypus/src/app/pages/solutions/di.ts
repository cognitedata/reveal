import {
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';

import { getCogniteSDKClient } from '@platypus-root/utils/cogniteSdk';

const client = getCogniteSDKClient();

export default {
  solutionsHandler: new SolutionsHandler(
    new SolutionsTemplatesApiService(client)
  ),
};
