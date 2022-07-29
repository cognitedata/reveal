import { Argv, Options, PositionalOptions } from 'yargs';
import {
  ArrayPromptOptions,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';

export class YargsCommandBuilder {
  buildArguments(yargs: Argv, args: CommandArgument[]): Argv {
    args.forEach((args) => this.buildYargArgument(yargs, args));
    return yargs;
  }

  private buildYargArgument(yargsInstance: Argv, arg: CommandArgument): Argv {
    if (arg.isPositional) {
      yargsInstance = yargsInstance.positional(
        arg.name,
        this.buildYargsArgumentOptions(arg)
      );
    } else {
      yargsInstance = yargsInstance.option(
        arg.name,
        this.buildYargsArgumentOptions(arg)
      );
    }

    if (arg.example) {
      yargsInstance = yargsInstance.example('\n' + arg.example, '');
    }

    switch (arg.type) {
      case CommandArgumentType.MULTI_SELECT: {
        const choices = (arg.options as ArrayPromptOptions).choices;
        yargsInstance.array(arg.name).choices(arg.name, [...choices, null]);
        break;
      }
      case CommandArgumentType.SELECT:
        yargsInstance
          .string(arg.name)
          .choices(arg.name, (arg.options as ArrayPromptOptions).choices);
        break;
      case CommandArgumentType.BOOLEAN:
        yargsInstance.boolean(arg.name);
        break;
      case CommandArgumentType.NUMBER:
        yargsInstance.number(arg.name);
        break;
      case CommandArgumentType.AUTOCOMPLETE:
      case CommandArgumentType.STRING:
        yargsInstance.string(arg.name);
        break;
    }

    return yargsInstance;
  }

  /**
   * Configures the yargs argument (option) options like: initial, name, description...etc
   * @param arg
   * @returns
   */
  private buildYargsArgumentOptions(arg: CommandArgument): PositionalOptions {
    const options = {
      description: arg.description,
    } as PositionalOptions;
    if (arg.initial) {
      options.default = arg.initial;
    }

    if (arg.alias) {
      options.alias = arg.alias;
    }

    return options;
  }
}
