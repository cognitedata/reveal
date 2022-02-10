import { Arguments } from 'yargs';
import Conf from 'conf';
import updateNotifier from 'update-notifier';

import { LoginArgs } from '../types';
import { setConfig } from '../utils/config';
import { AUTH_TYPE, CONSTANTS } from '../constants';
import { Log } from '../utils/logger';

import { enable } from 'debug';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../../package.json');

export async function init(args: Arguments<LoginArgs>) {
  // check and notify for the update
  updateNotifier({
    shouldNotifyInNpmScript: true,
    distTag: 'alpha',
    pkg,
  }).notify({
    message:
      'There is a newer version of {packageName} is available.\nTo update run `{updateCommand}`\nTo skip check https://github.com/cognitedata/platypus/blob/master/apps/platypus-cdf-cli/README.md#update-notifier',
  });

  // enable debug logger if --verbose flag is set
  if (args.verbose) {
    enable('platypus*');
  }

  // set config object
  setConfig(
    new Conf({ projectName: CONSTANTS.APP_ID, configName: 'cdf-credentials' })
  );
  // set logger
  args.logger = new Log();
  // set auth type based on api_key
  if (args.apiKey) {
    args.authType = AUTH_TYPE.APIKEY;
    args['auth-type'] = AUTH_TYPE.APIKEY;
  }
  if (args.clientSecret) {
    args.authType = AUTH_TYPE.CLIENT_SECRET;
    args['auth-type'] = AUTH_TYPE.CLIENT_SECRET;
  }
}
