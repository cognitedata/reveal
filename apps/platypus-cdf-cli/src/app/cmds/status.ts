import { Arguments, CommandModule } from 'yargs';
import { BaseArgs } from '../types';

class LoginStatusCommand implements CommandModule {
  public readonly command = 'status';
  public readonly describe = 'Check user login status (fails if not logged-in)';
  handler(args: Arguments<BaseArgs>) {
    args.logger.success('Account is logged-in');
  }
}

export default new LoginStatusCommand();
