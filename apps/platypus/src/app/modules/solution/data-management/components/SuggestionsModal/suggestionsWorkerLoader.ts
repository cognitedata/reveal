import { CorsWorker } from '@platypus-app/CorsWorker';

function getSuggestionsWorker() {
  return new CorsWorker('./suggestions-worker.js').getWorker();
}

export { getSuggestionsWorker };
