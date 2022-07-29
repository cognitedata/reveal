import { KeyValueMap } from '@platypus/platypus-core';
import Enquirer from 'enquirer';
import {
  ArrayPromptOptions,
  BooleanPromptOptions,
  CommandArgument,
  NumberPromptOptions,
} from '../types';

let answers = {};
const enquirer = new Enquirer({}, answers);

const buildBasePrompt = (commandArg: CommandArgument) => {
  const prompt = {
    type: 'input',
    name: commandArg.name,
    message: commandArg.prompt,
  };

  if (commandArg.required) {
    prompt['required'] = true;
  }

  if (commandArg.initial) {
    prompt['initial'] = commandArg.initial;
  }

  if (commandArg.skip) {
    prompt['skip'] = commandArg.skip;
    // prompt['skip'] = () => {
    //   return (commandArg.skip as any)((enquirer as any).answers);
    // };
  }

  return prompt;
};

export const setAnswers = (values: KeyValueMap) => {
  answers = Object.assign({}, values);
  (enquirer as any).answers = answers;
};

export const showInput = (commandArg: CommandArgument) => {
  return buildBasePrompt(commandArg);
};

export const showNumeric = (commandArg: CommandArgument) => {
  return Object.assign(buildBasePrompt(commandArg), commandArg.options, {
    type: 'numeral',
  } as NumberPromptOptions);
};

export const showConfirm = (commandArg: CommandArgument) => {
  return Object.assign(buildBasePrompt(commandArg), {
    type: 'confirm',
  } as BooleanPromptOptions);
};

export const showSelect = (commandArg: CommandArgument) => {
  const cmdOptions = commandArg.options as ArrayPromptOptions;
  return Object.assign(buildBasePrompt(commandArg), {
    type: 'select',
    choices: cmdOptions.choices,
    muliple: false,
    sort: cmdOptions.sort || true,
  } as ArrayPromptOptions);
};

export const showMultiSelect = (commandArg: CommandArgument) => {
  const cmdOptions = commandArg.options as ArrayPromptOptions;

  return Object.assign(buildBasePrompt(commandArg), {
    type: 'multiselect',
    choices: cmdOptions.choices.filter((option) => option !== null),
    muliple: true,
    sort: cmdOptions.sort || true,
  } as ArrayPromptOptions);
};

export const showAutocomplete = (commandArg: CommandArgument) => {
  const cmdOptions = commandArg.options as ArrayPromptOptions;

  return Object.assign(buildBasePrompt(commandArg), {
    type: 'autocomplete',
    choices: cmdOptions.choices,
    muliple: false,
    sort: cmdOptions.sort || true,
    suggest: (input, choices) => {
      const str = input.toLowerCase();

      const filtered = choices
        .filter((ch) => !ch._userInput)
        .filter((ch) => ch.message.toLowerCase().includes(str));

      if (!filtered.length) {
        filtered.push({
          name: input,
          message: input,
          value: input,
          _userInput: true,
        });
      }

      return filtered;
    },
  } as any);
};

export function promptQuestions(questions: any) {
  return enquirer.prompt(questions);
}
