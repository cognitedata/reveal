import { CommandArgument, CommandArgumentType } from '../../types';
import {
  showAutocomplete,
  showConfirm,
  showInput,
  showInputWithDefault,
  showMultiSelect,
  showNumeric,
  showSelect,
} from '@cognite/platypus-cdf-cli/app/utils/enquirer-utils';

import { KeyValueMap } from '@platypus/platypus-core';

export class EnquirerCommandBuilder {
  build(commandArg: CommandArgument, commandArgs: KeyValueMap) {
    switch (commandArg.type) {
      case CommandArgumentType.BOOLEAN:
        return showConfirm(commandArg);
      case CommandArgumentType.DECIMAL:
      case CommandArgumentType.NUMBER:
        return showNumeric(commandArg);
      case CommandArgumentType.SELECT:
        return showSelect(commandArg);
      case CommandArgumentType.MULTI_SELECT:
        return showMultiSelect(commandArg);
      case CommandArgumentType.AUTOCOMPLETE:
        return showAutocomplete(commandArg);
      case CommandArgumentType.STRING:
        if (commandArg.promptDefaultValue) {
          if (commandArg.promptDefaultValue instanceof Function) {
            return showInputWithDefault(
              commandArg,
              commandArg.promptDefaultValue(commandArgs)
            );
          } else {
            return showInputWithDefault(
              commandArg,
              commandArg.promptDefaultValue
            );
          }
        } else {
          return showInput(commandArg);
        }
      default:
        return showInput(commandArg);
    }
  }
}
