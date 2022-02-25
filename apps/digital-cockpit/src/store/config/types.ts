import { AllIconTypes } from '@cognite/cogs.js';
import { ActionType } from 'typesafe-actions';

import * as actions from './actions';

export enum ConfigActionTypes {
  ADD_CONFIG_ITEMS = 'config/ADD_CONFIG_ITEMS',
}

export type ConfigItems = Record<string, any>;

export interface ConfigState extends ConfigItems {
  dataSetId?: number;
  customerLogoFetched?: boolean;
  applications?: string[];
  useAllGroups: boolean;
}
export type ConfigRootAction = ActionType<typeof actions>;

export type ApplicationItem = {
  key: string;
  iconKey: string;
  title: string;
  url: string;
  urlTemplate?: string;
  rightIconKey?: AllIconTypes;
};

export type AppConfigItemResponse = {
  values: string[];
};

export type ConfigItemPayload = {
  name: string;
  values: string[];
};
