/**  This is the built in way how to load the web workers using webpack is with worker-loader */
import { CorsWorker } from '@platypus-app/CorsWorker';

function getGraphQlWorker() {
  return new CorsWorker('/graphql-worker.js').getWorker();
}

export { getGraphQlWorker };
