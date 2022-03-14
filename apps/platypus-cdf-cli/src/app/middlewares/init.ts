import { Arguments } from 'yargs';
import updateNotifier from 'update-notifier';

import { BaseArgs } from '../types';
import { getConfig } from '../utils/config';
import { AUTH_TYPE, CONSTANTS, ROOT_CONFIG_KEY } from '../constants';
import { Log } from '../utils/logger';
import { enable } from 'debug';
import { getMixpanel } from '../utils/mixpanel';
import { getCompleteCommandString } from '../utils/yargs-utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../../package.json');

export async function init(args: Arguments<BaseArgs>) {
  const globalConfig = getConfig();

  // check and notify for the update
  if (globalConfig.get(ROOT_CONFIG_KEY.AUTO_CHECK_FOR_UPDATES)) {
    updateNotifier({
      shouldNotifyInNpmScript: true,
      distTag: 'alpha',
      pkg,
    }).notify({
      message:
        'There is a newer version of {packageName} is available.\nTo update run `{updateCommand}`\nTo skip check https://github.com/cognitedata/platypus/blob/master/apps/platypus-cdf-cli/README.md#update-notifier',
    });
  }

  // enable debug logger if --verbose flag is set
  if (args.verbose) {
    enable(`${CONSTANTS.APP_ID}*`);
  }

  const authConfig = globalConfig.get(ROOT_CONFIG_KEY.AUTH);

  // set logger
  args.logger = new Log();

  // setup mixpanel if telemetry enabled
  if (globalConfig.get(ROOT_CONFIG_KEY.TELEMETRY_DISABLED) === false) {
    args.mixpanel = getMixpanel();

    // track command
    args.mixpanel?.track(getCompleteCommandString(args), {
      project: authConfig?.project,
      cluster: authConfig?.cluster,
    });
  }

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
