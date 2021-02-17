import { createReducer } from 'typesafe-actions';
import isArray from 'lodash/isArray';
import {
  NotificationState,
  NotificationTypes,
  NotificationRootAction,
} from './types';

const initialState: NotificationState = {
  type: 'default',
  title: '',
  message: '',
};

export const NotificationReducer = createReducer(initialState)
  .handleAction(
    NotificationTypes.SET_ERROR,
    (state: NotificationState, action: NotificationRootAction) => ({
      type: 'error',
      title: isArray(action.payload) ? action.payload[0] : action.payload,
      message: isArray(action.payload)
        ? action.payload.slice(1).join('. ')
        : '',
    })
  )
  .handleAction(
    NotificationTypes.SET_NOTIFICATION,
    (state: NotificationState, action: NotificationRootAction) => ({
      type: 'success',
      title: isArray(action.payload) ? action.payload[0] : action.payload,
      message: isArray(action.payload)
        ? action.payload.slice(1).join('. ')
        : '',
    })
  )
  .handleAction(NotificationTypes.CLEAR_NOTIFICATION, () => ({
    type: 'default',
    title: '',
    message: '',
  }));
