import { Logger, ValidationRule } from '@platypus/platypus-core';
import { ConfigSchema } from './common/config';
import { AUTH_CONFIG, AUTH_TYPE, LOGIN_STATUS } from './constants';

export type BaseArgs = {
  appId: string;
  logger: Logger;
  solutionConfig?: ConfigSchema;
};

export type LoginArgs = BaseArgs & {
  [AUTH_CONFIG.PROJECT]: string;
  [AUTH_CONFIG.CLIENT_ID]: string;
  [AUTH_CONFIG.CLIENT_SECRET]?: string;
  [AUTH_CONFIG.TENANT]: string;
  [AUTH_CONFIG.CLUSTER]: string;
  [AUTH_CONFIG.AUTH_TYPE]: AUTH_TYPE;
  [AUTH_CONFIG.API_KEY]: string;
};

export interface ProjectConfig extends Omit<LoginArgs, keyof BaseArgs> {
  [AUTH_CONFIG.LOGIN_STATUS]: LOGIN_STATUS;
  [AUTH_CONFIG.AUTH_TOKEN]: string;
}

export interface KeyValuePairs {
  [key: string]: string | number;
}

export enum CommandArgumentType {
  STRING = 'string',
  NUMBER = 'number',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  AUTOCOMPLETE = 'autocomplete',
  MULTI_SELECT = 'multi_select',
}

export interface BasePromptOptions {
  name: string;
  type: string;
  message: string;
  initial?: any;
  required?: boolean;
}

export interface ArrayPromptOptions extends BasePromptOptions {
  type: 'autocomplete' | 'form' | 'multiselect' | 'select' | 'list';
  choices: string[];
  muliple?: boolean;
  sort?: boolean;
}

export interface BooleanPromptOptions extends BasePromptOptions {
  type: 'confirm';
  initial?: boolean;
}

export interface StringPromptOptions extends BasePromptOptions {
  type: 'input' | 'invisible' | 'list' | 'password' | 'text';
  initial?: string;
}

export interface NumberPromptOptions extends BasePromptOptions {
  type: 'numeral';
  min?: number;
  max?: number;
  float?: boolean;
  round?: boolean;
  initial?: number;
}

export type PromptOptions =
  | BasePromptOptions
  | ArrayPromptOptions
  | BooleanPromptOptions
  | StringPromptOptions
  | NumberPromptOptions;

export interface CommandArgument {
  /** the name of the argument(property) */
  name: string;
  /** */
  alias?: string;
  /** The description that will be shown when listing all commands */
  description: string;
  /** The prompt message that will be shown to the user if value is empty */
  prompt?: string;
  /** The default value for this arg */
  initial?: string | boolean | number;
  /** Is required */
  required: boolean;
  /** Argument type.
   * This will be used to convert the value to expected format,
   * validate the value and show the appropriate prompt message */
  type: CommandArgumentType;
  /** Use this field to pass any additional config needed for the prompt ex: options */
  options?: PromptOptions;
  validators?: ValidationRule[];
  /* Display optional help message if user pass --help */
  help?: string;
  /* Example how to use some command */
  example?: string;
  skip?: ((state: any) => boolean | Promise<boolean>) | boolean;
}
