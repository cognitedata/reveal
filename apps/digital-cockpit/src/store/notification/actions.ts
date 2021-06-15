import { createAction } from 'typesafe-actions';
import { NotificationTypes } from './types';

export const setNotification = createAction(
  NotificationTypes.SET_NOTIFICATION
)<string>();
export const setError = createAction(NotificationTypes.SET_ERROR)<
  string | string[]
>();
export const clearNotification = createAction(
  NotificationTypes.CLEAR_NOTIFICATION
)<void>();
