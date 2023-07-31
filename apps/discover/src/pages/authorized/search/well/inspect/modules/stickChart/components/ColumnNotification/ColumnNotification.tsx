import * as React from 'react';

import { ColumnNotificationText } from './elements';

export interface ColumnNotificationProps {
  content: string;
  visible?: boolean;
}

export const ColumnNotification: React.FC<ColumnNotificationProps> = ({
  content,
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  return <ColumnNotificationText>{content}</ColumnNotificationText>;
};
