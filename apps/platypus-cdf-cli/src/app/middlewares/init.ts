import { Arguments } from 'yargs';
import Conf from 'conf';
import updateNotifier from 'update-notifier';

import { LoginArgs } from '../types';
import { setConfig } from '../utils/config';
import { AUTH_TYPE } from '../constants';
import { Log } from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../../package.json');

export async function init(args: Arguments<LoginArgs>) {
  // check and notify for the update
  updateNotifier({
    shouldNotifyInNpmScript: true,
    distTag: 'alpha',
    pkg,
  }).notify({message: 'There is a newer version of {packageName} is available.\nTo update run `{updateCommand}`\nTo skip check https://github.com/cognitedata/platypus/blob/master/apps/platypus-cdf-cli/README.md#update-notifier'});

  // set config object
  setConfig(
    new Conf({ projectName: args.appId, configName: 'cdf-credentials' })
  );
  // set logger
  args.logger = new Log();
  // set auth type based on api_key
  if (args.apiKey) {
    args.authType = AUTH_TYPE.LEGACY;
    args['auth-type'] = AUTH_TYPE.LEGACY;
  }
}
