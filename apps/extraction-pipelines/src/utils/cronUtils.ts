import { toString as cronstureToString } from 'cronstrue';

export const parseCron = (cron: string) => {
  return cronstureToString(cron);
};
