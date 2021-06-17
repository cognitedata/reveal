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
}
export type ConfigRootAction = ActionType<typeof actions>;

export type ApplicationItem = {
  key: string;
  iconKey: string;
  title: string;
  url: string;
};
