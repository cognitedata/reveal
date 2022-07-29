import {
  KeyValueMap,
  NumericFieldValidator,
  NumericFieldValidatorOptions,
  RequiredFieldValidator,
  Validator,
  ValidatorResult,
} from '@platypus/platypus-core';
import { Argv } from 'yargs';
import {
  CommandArgument,
  CommandArgumentType,
  NumberPromptOptions,
} from '@cognite/platypus-cdf-cli/app/types';

import { EnquirerCommandBuilder } from './enquirer-command-builder';
import { YargsCommandBuilder } from './yargs-command-builder';

export class CommandBuilderService {
  private yargsBuilder: YargsCommandBuilder;
  private enquirerBuilder: EnquirerCommandBuilder;

  constructor() {
    this.yargsBuilder = new YargsCommandBuilder();
    this.enquirerBuilder = new EnquirerCommandBuilder();
  }

  buildYargsArguments(yargs: Argv, commandArguments: CommandArgument[]): Argv {
    return this.yargsBuilder.buildArguments(yargs, commandArguments);
  }

  validateArgs(
    args: KeyValueMap,
    commandArgs: CommandArgument[]
  ): ValidatorResult {
    const validator = new Validator(args);

    commandArgs.forEach((arg) => {
      if (arg.required) {
        switch (arg.type) {
          case CommandArgumentType.NUMBER: {
            validator.addRule(
              arg.name,
              new RequiredFieldValidator({
                validationMessage: arg.prompt,
              })
            );

            const argOptions = arg.options as NumberPromptOptions;
            const numberRangeOptions = {
              min: argOptions.min,
            } as NumericFieldValidatorOptions;

            if (argOptions.max) {
              numberRangeOptions.max = argOptions.max;
            }
            validator.addRule(
              arg.name,
              new NumericFieldValidator({
                validationMessage: arg.prompt,
                options: numberRangeOptions,
              })
            );
            break;
          }
          case CommandArgumentType.MULTI_SELECT: {
            validator.addRule(
              arg.name,
              new RequiredFieldValidator({
                validationMessage: arg.prompt,
              })
            );
            break;
          }
          default:
          case CommandArgumentType.STRING: {
            validator.addRule(
              arg.name,
              new RequiredFieldValidator({
                validationMessage: arg.prompt,
              })
            );
            break;
          }
        }
      }
    });

    return validator.validate();
  }

  generatePromptsFromErrors(
    commandValues: KeyValueMap,
    commandArgs: CommandArgument[],
    argsPromptsMap: KeyValueMap
  ) {
    return this.enquirerBuilder.build(
      commandValues,
      commandArgs,
      argsPromptsMap
    );
  }
}

export default new CommandBuilderService();
