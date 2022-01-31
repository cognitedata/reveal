import { Arguments } from 'yargs';
import { getCommandName } from '../utils/yargs-utils';

export const skipMiddleware = (args: Arguments): boolean => {
  if (['logout'].includes(getCommandName(args).toString())) {
    return true;
  }
  return false;
};
