import {
  SolutionsHandler,
  SolutionTemplatesFacadeService,
  TemplatesApiService,
} from '@platypus/platypus-core';

import { getCogniteSDKClient } from '@platypus-app/utils/cogniteSdk';

export default () => {
  return {
    solutionsHandler: new SolutionsHandler(
      new SolutionTemplatesFacadeService(
        new TemplatesApiService(getCogniteSDKClient())
      )
    ),
  };
};
