export interface NotificationState {
  type: NotificationType;
  title?: string;
  message?: string;
}

export enum NotificationType {
  'success' = 'success',
  'error' = 'error',
  'default' = 'default',
}
