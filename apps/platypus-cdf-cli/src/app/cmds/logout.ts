import { Arguments, CommandModule } from 'yargs';
import logout from '../common/auth/logout';
import { BaseArgs } from '../types';

class LogoutCommand implements CommandModule {
  public readonly command = 'logout';
  public readonly describe = 'Logout CDF User (globally)';

  handler(arg: Arguments<BaseArgs>) {
    logout();
    arg.logger.success('You have been logged-out successfully!');
  }
}

export default new LogoutCommand();
