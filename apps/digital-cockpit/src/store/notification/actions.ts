import { createAction } from 'typesafe-actions';
import { NotificationState, NotificationTypes } from './types';

export const setNotification = createAction(NotificationTypes.SET_NOTIFICATION)<
  string | string[]
>();
export const setError = createAction(NotificationTypes.SET_ERROR)<
  string | string[]
>();
export const setCustomNotification = createAction(
  NotificationTypes.SET_CUSTOM_NOTIFICATION
)<NotificationState>();
export const clearNotification = createAction(
  NotificationTypes.CLEAR_NOTIFICATION
)<void>();
