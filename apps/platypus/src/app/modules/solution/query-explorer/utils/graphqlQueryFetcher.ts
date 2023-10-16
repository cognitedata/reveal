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
    const runGraphQlQuery = rootInjector.get(TOKENS.runGraphQlQuery);
    return new Promise((resolve, reject) => {
      runGraphQlQuery
        .execute({
          graphQlParams,
          dataModelId,
          schemaVersion: version,
          space,
        })
        .then((result) => resolve(result.data))
        .catch((error) => {
          if (error.code !== 409) {
            Notification({ type: 'error', message: error.message });
          }
          reject(error);
        });
    });
  },
};
