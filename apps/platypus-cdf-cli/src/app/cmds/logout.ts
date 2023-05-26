import { Arguments, Argv, CommandModule } from 'yargs';

import logout from '../common/auth/logout';
import { BaseArgs } from '../types';

class LogoutCommand implements CommandModule {
  public readonly command = 'signout';
  public readonly aliases = ['logout'];
  public readonly describe = 'Sign out current user.';

  builder(yargs: Argv) {
    return yargs.version(false);
  }

  handler(arg: Arguments<BaseArgs>) {
    logout();
    arg.logger.success('You have been signed out.');
  }
}

export default new LogoutCommand();
