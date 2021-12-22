export interface NotificationState {
  type: NotificationType;
  title?: string;
  message?: string;
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Default = 'default',
}
