import { Arguments, CommandModule } from 'yargs';
import { BaseArgs } from '../../types';

export class LoginStatusCommand implements CommandModule {
  public readonly command = 'status';
  public readonly describe = 'Check user login status (fails if not logged-in)';
  handler(args: Arguments<BaseArgs>) {
    args.logger.info('Account is logged-in');
  }
}
