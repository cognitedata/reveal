import { CorsWorker } from '../../../../../CorsWorker';

function getSuggestionsWorker() {
  return new CorsWorker('./suggestions-worker.js').getWorker();
}

export { getSuggestionsWorker };
