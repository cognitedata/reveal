import { createAction } from 'typesafe-actions';
import { ConfigActionTypes, ConfigItems } from './types';

export const addConfigItems = createAction(
  ConfigActionTypes.ADD_CONFIG_ITEMS
)<ConfigItems>();
