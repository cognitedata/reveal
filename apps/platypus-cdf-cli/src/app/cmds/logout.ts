import { Arguments, CommandModule } from 'yargs';
import { ROOT_CONFIG_KEY } from '../constants';
import { BaseArgs } from '../types';
import { setProjectConfigItem } from '../utils/config';

export class LogoutCommand implements CommandModule {
  public readonly command = 'logout';
  public readonly describe = 'Logout CDF User (globally)';

  handler(arg: Arguments<BaseArgs>) {
    setProjectConfigItem(ROOT_CONFIG_KEY.AUTH, undefined);
    arg.logger.info('You have been logout successfully!');
  }
}
