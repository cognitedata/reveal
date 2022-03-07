import { Arguments, CommandModule } from 'yargs';
import Table from 'cli-table';
import { green } from 'chalk';
import { BaseArgs } from '../types';
import { getConfig } from '../utils/config';
import { DEBUG as _DEBUG } from '../utils/logger';
import { ROOT_CONFIG_KEY } from '../constants';

const DEBUG = _DEBUG.extend('cmd:status');
class LoginStatusCommand implements CommandModule {
  public readonly command = 'status';
  public readonly describe = 'Check user login status (fails if not logged-in)';
  handler(args: Arguments<BaseArgs>) {
    const globalConfig = getConfig();
    const authConfig = globalConfig.get(ROOT_CONFIG_KEY.AUTH);
    const { project, cluster, tenant, msalAccountInfo } = authConfig;
    DEBUG('Global config is stored at %s', globalConfig.path);

    const table = new Table({
      head: ['Status', green('User is authenticated')],
    });
    table.push(['Tenant', tenant], ['Cluster', cluster], ['Project', project]);
    if (msalAccountInfo) {
      let username = '',
        name = '';
      try {
        const d = JSON.parse(msalAccountInfo);
        d.username && (username = d.username);
        d.name && (name = d.name);
      } finally {
        table.push(['Username', username], ['Name', name]);
      }
    }

    args.logger.log(table.toString());
  }
}

export default new LoginStatusCommand();
