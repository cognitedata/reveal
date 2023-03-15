import { Arguments, CommandModule } from 'yargs';
import Table from 'cli-table3';
import { green } from 'chalk';
import { BaseArgs } from '../types';
import { getConfig } from '../utils/config';
import { DEBUG as _DEBUG } from '../utils/logger';
import { ROOT_CONFIG_KEY } from '../constants';

const DEBUG = _DEBUG.extend('cmd:status');
class LoginStatusCommand implements CommandModule {
  public readonly command = 'status';
  public readonly describe = 'Check if current user is signed in.';
  handler(args: Arguments<BaseArgs>) {
    const globalConfig = getConfig();
    const authConfig = globalConfig.get(ROOT_CONFIG_KEY.AUTH);
    const { project, cluster, tenant, msalAccountInfo } = authConfig;
    DEBUG('Global config is stored at %s', globalConfig.path);

    const table = new Table();
    table.push(
      ['Status', green('User is authenticated')],
      ['Tenant', tenant],
      ['Cluster', cluster],
      ['Project', project]
    );
    if (msalAccountInfo) {
      let username = '',
        name = '';
      try {
        const accountInfo = JSON.parse(msalAccountInfo);
        accountInfo?.username && (username = accountInfo.username);
        accountInfo?.name && (name = accountInfo.name);
      } finally {
        table.push(['Username', username], ['Name', name]);
      }
    }

    args.logger.log(table.toString());
  }
}

export default new LoginStatusCommand();
