import { CorsWorker } from '../CorsWorker';

export const initDMWorker = async (): Promise<Worker> => {
  return await new CorsWorker('./dm-worker.js').getWorker();
};
