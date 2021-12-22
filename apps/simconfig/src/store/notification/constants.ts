import type { NotificationState } from './types';
import { NotificationType } from './types';

export const initialState: NotificationState = {
  type: NotificationType.Success,
  title: undefined,
  message: undefined,
};
