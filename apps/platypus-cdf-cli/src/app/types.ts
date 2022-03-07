import { Logger, ValidationRule } from '@platypus/platypus-core';
import { Mixpanel } from 'mixpanel';
import { AUTH_CONFIG, AUTH_TYPE, LOGIN_STATUS } from './constants';

export type BaseArgs = {
  appId: string;
  verbose: boolean;
  interactive: boolean;
  logger: Logger;
  mixpanel?: Mixpanel;
  solutionConfig?: CLIConfigManager<SolutionConfigType>;
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
  [AUTH_CONFIG.MSAL_AUTH_CACHE]?: string;
  [AUTH_CONFIG.ACCOUNT_INFO]?: string;
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
  required?: boolean;
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

export type SolutionConfigType = {
  version: number;
  name: string;
  config: {
    templateId: string;
    templateVersion: number;
    project: string;
    cluster: string;
    backend: string;
    schema?: string;
  };
};
export interface CLIConfigManager<T> {
  all: T;
  /**
   * Get an item
   * @param key The string key to get
   * @return The contents of the config from key $key
   */
  get(key: string): T[keyof T];

  /**
   * Set an item
   * @param key The string key
   * @param val The value to set
   */
  set(key: string, value: unknown): void;

  /**
   * Delete an item.
   * @param key The key to delete
   */
  delete(key: keyof T): void;

  /**
   * Clear the config.
   * Equivalent to <code>Configstore.all = {};</code>
   */
  clear(): void;
}
