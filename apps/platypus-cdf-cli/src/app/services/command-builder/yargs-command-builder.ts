import { Argv, Options } from 'yargs';
import {
  ArrayPromptOptions,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';

export class YargsCommandBuilder {
  buildOptions(
    yargs: Argv,
    commandName: string,
    args: CommandArgument[]
  ): Argv {
    const yargsInstance = yargs;

    args.forEach((arg) => this.buildYargOption(yargsInstance, arg));
    return yargsInstance;
  }

  private buildYargOption(yargsInstance: Argv, arg: CommandArgument): Argv {
    yargsInstance = yargsInstance.option(
      arg.name,
      this.buildYargsArgumentOptions(arg)
    );

    if (arg.example) {
      yargsInstance = yargsInstance.example(arg.example, '');
    }

    switch (arg.type) {
      case CommandArgumentType.MULTI_SELECT:
        yargsInstance
          .array(arg.name)
          .choices(arg.name, (arg.options as ArrayPromptOptions).choices);
        break;
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
  private buildYargsArgumentOptions(arg: CommandArgument) {
    const options = {
      description: arg.description,
    } as Options;
    if (arg.initial) {
      options.default = arg.initial;
    }

    if (arg.alias) {
      options.alias = arg.alias;
    }

    return options;
  }
}
