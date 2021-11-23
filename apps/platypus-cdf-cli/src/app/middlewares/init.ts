import { Arguments } from 'yargs';
import Conf from 'conf';
import { LoginArgs } from '../types';
import { setConfig } from '../utils/config';
import { AUTH_TYPE } from '../constants';
import { Log } from '../utils/logger';

export async function init(args: Arguments<LoginArgs>) {
  setConfig(new Conf({ projectName: args.appId }));
  args.logger = new Log();
  // set auth type based on api_key
  if (args.apiKey) {
    args.authType = AUTH_TYPE.LEGACY;
    args['auth-type'] = AUTH_TYPE.LEGACY;
  }
}
