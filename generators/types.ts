import { ActionType, ActionConfig } from 'node-plop';
import { Answers } from 'inquirer';

export type TransformFn<T> = (
  template: string,
  data: any,
  cfg: T
) => string | Promise<string>;

export interface CopyManyActionConfig extends ActionConfig {
  type: 'copyMany';
  base: string;
  destination: string;
  ignore: string[];
  transform?: TransformFn<CopyManyActionConfig>;
}

export interface AddLibraryActionConfig extends ActionConfig {
  type: 'addLibrary';
  base: string;
}

export interface DisableIntercomActionConfig extends ActionConfig {
  type: 'disableIntercom';
  path: string;
  skip?: (answers: Answers) => string;
}

export interface DisableExperimentalActionConfig extends ActionConfig {
  type: 'disableExperimental';
  base: string;
}

export type ExpandedActionType =
  | ActionType
  | CopyManyActionConfig
  | AddLibraryActionConfig
  | DisableIntercomActionConfig
  | DisableExperimentalActionConfig;
