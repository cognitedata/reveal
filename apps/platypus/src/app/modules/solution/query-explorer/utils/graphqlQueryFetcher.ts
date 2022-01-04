import services from '@platypus-app/di';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { FetcherParams, FetcherResult } from '@graphiql/toolkit';

export default {
  fetcher: (
    graphQlParams: FetcherParams,
    solutionId: string,
    version: string
  ): Promise<FetcherResult> => {
    const solutionSchemaHandler = services().solutionSchemaHandler;
    return new Promise((resolve, reject) => {
      solutionSchemaHandler
        .runQuery({
          graphQlParams,
          solutionId,
          schemaVersion: version,
        })
        .then((result) => {
          if (!result.isSuccess) {
            reject(result.error);
          }

          resolve(result.getValue());
        })
        .catch((error) => {
          console.error(error);
          Notification({ type: 'error', message: error.message });
          reject(error);
        });
    });
  },
};
