import { Arguments, Argv, CommandModule } from 'yargs';

import { BaseArgs, CommandArgument } from '@cognite/platypus-cdf-cli/app/types';
import { promptQuestions } from '../utils/enquirer-utils';
import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';
import Response from '../utils/logger';
import { CommandBuilderService } from '../services';

export abstract class CLICommand implements CommandModule {
  command: string;
  describe: string;
  private _args: CommandArgument[];
  private commandBuilder: CommandBuilderService;

  constructor(
    commandName: string,
    description: string,
    args: CommandArgument[]
  ) {
    this.command = commandName;
    this.describe = description;
    this._args = args;
    this.commandBuilder = new CommandBuilderService();
    this.builder = this.builder.bind(this);
    this.handler = this.handler.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  get args(): CommandArgument[] {
    return this._args;
  }

  set args(newArgs: CommandArgument[]) {
    this._args = newArgs;
  }

  builder<T>(yargs: Argv<T>): Argv {
    return this.commandBuilder
      .buildYargsOptions(yargs, this.command, this._args)
      .fail((msg, err) => {
        this.handleError(this.command, msg, err, CONSTANTS.MANUAL_WEBSITE);
        process.exit(1);
      });
  }

  async handler<T>(args: Arguments<BaseArgs & T>) {
    const validationResult = this.commandBuilder.validateArgs(args, this._args);

    if (!args.interactive && !validationResult.valid) {
      Response.error(JSON.stringify(validationResult.errors));
      throw new Error('Invalid arguments');
    }

    if (!validationResult.valid) {
      const prompts = this.commandBuilder.generatePromptsFromErrors(
        args,
        this._args,
        validationResult.errors
      );

      const result = await promptQuestions(prompts);
      args = Object.assign(args, result);

      const validationResultAfterPrompt = this.commandBuilder.validateArgs(
        args,
        this._args
      );
      if (!validationResultAfterPrompt.valid) {
        const errorMessage = Object.keys(validationResultAfterPrompt.errors)
          .map(
            (argName) =>
              `Please provide value for argument ${argName}. Example: --${argName}=<value>\nError message: ${validationResultAfterPrompt.errors[argName]}`
          )
          .join('\n');
        this.handleError(this.command, errorMessage);
        process.exit(1);
      }
    }

    try {
      await this.execute(args);
    } catch (err) {
      if (args.verbose && args.verbose === true) {
        Response.error(JSON.stringify(err, null, 2));
      } else {
        Response.error(`${err.code} - ${err.message}`);
      }
    }
  }

  abstract execute(args: Arguments<unknown>): Promise<void>;

  handleError(
    commandName: string,
    message: string,
    error?: Error,
    docsUrl?: string
  ) {
    Response.error(`Error while running ${commandName} command\n`);

    if (message) {
      Response.error(message, error);
    }

    Response.info(
      docsUrl ||
        'Visit https://github.com/cognitedata/platypus for documentation about this command.'
    );
  }
}
