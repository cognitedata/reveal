import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export const NotificationTypes = {
  SET_NOTIFICATION: `notification/SET_NOTIFICATION`,
  SET_ERROR: `notification/SET_ERROR`,
  CLEAR_NOTIFICATION: `notification/CLEAR_NOTIFICATION`,
};

export type NotificationRootAction = ActionType<typeof actions>;

export type NotificationType = 'success' | 'error' | 'default';
export type NotificationState = {
  type: NotificationType;
  title: string;
  message: string;
};
