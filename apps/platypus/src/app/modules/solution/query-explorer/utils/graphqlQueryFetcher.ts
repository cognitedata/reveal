import { FetcherParams } from '@graphiql/toolkit';
import { ExecutionResult } from 'graphql-ws';

import { Notification } from '../../../../components/Notification/Notification';
import { rootInjector, TOKENS } from '../../../../di';

export default {
  fetcher: (
    graphQlParams: FetcherParams,
    dataModelId: string,
    version: string,
    space: string
  ): Promise<ExecutionResult> => {
    const solutionSchemaHandler = rootInjector.get(
      TOKENS.dataModelVersionHandler
    );
    return new Promise((resolve, reject) => {
      solutionSchemaHandler
        .runQuery({
          graphQlParams,
          dataModelId,
          schemaVersion: version,
          space,
        })
        .then((result) => {
          if (!result.isSuccess) {
            reject(result.error);
          }

          resolve(result.getValue().data);
        })
        .catch((error) => {
          if (error.code !== 409) {
            Notification({ type: 'error', message: error.message });
          }
          reject(error);
        });
    });
  },
};
