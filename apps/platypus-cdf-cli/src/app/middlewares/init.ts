import { Arguments } from 'yargs';
import updateNotifier from 'update-notifier';

import { enable } from 'debug';
import { BaseArgs } from '../types';
import { getConfig } from '../utils/config';
import { CONSTANTS, ROOT_CONFIG_KEY } from '../constants';
import { Log } from '../utils/logger';
import { track } from '../utils/mixpanel';
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

  // set logger
  args.logger = new Log();

  // setup mixpanel if telemetry enabled
  if (globalConfig.get(ROOT_CONFIG_KEY.TELEMETRY_DISABLED) === false) {
    // track command
    track('CLI.Command', {
      command: getCompleteCommandString(args),
    });
  }
}
