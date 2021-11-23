import { NotificationState, NotificationType } from './types';

export const initialState: NotificationState = {
  type: NotificationType.success,
  title: undefined,
  message: undefined,
};
