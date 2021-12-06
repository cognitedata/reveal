import { KeyValueMap } from '@platypus/platypus-core';
import { CommandArgument, CommandArgumentType } from '../../types';
import {
  setAnswers,
  showAutocomplete,
  showConfirm,
  showInput,
  showMultiSelect,
  showNumeric,
  showSelect,
} from '@cognite/platypus-cdf-cli/app/utils/enquirer-utils';

export class EnquirerCommandBuilder {
  build(
    commandValues: KeyValueMap,
    commandArgs: CommandArgument[],
    argsPromptsMap: KeyValueMap
  ) {
    const prompts = [];
    setAnswers(commandValues);
    for (const argErrorName in argsPromptsMap) {
      const cmdArg = commandArgs.find((arg) => arg.name === argErrorName);

      switch (cmdArg.type) {
        case CommandArgumentType.BOOLEAN:
          prompts.push(showConfirm(cmdArg));
          break;
        case CommandArgumentType.DECIMAL:
        case CommandArgumentType.NUMBER:
          prompts.push(showNumeric(cmdArg));
          break;
        case CommandArgumentType.SELECT:
          prompts.push(showSelect(cmdArg));
          break;
        case CommandArgumentType.MULTI_SELECT:
          prompts.push(showMultiSelect(cmdArg));
          break;
        case CommandArgumentType.AUTOCOMPLETE:
          prompts.push(showAutocomplete(cmdArg));
          break;
        case CommandArgumentType.STRING:
        default:
          prompts.push(showInput(cmdArg));
          break;
      }
    }

    return prompts;
  }
}
