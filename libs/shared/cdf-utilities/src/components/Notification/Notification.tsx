import React from 'react';
import { notification as _notification } from 'antd';
import {
  ArgsProps,
  NotificationApi,
  NotificationInstance,
} from 'antd/lib/notification';
import { Icon } from '@cognite/cogs.js';

import 'antd/lib/notification/style/index.css';

const baseArgs: Partial<ArgsProps> = {
  closeIcon: (
    <span className="cogs-notification-close">
      <Icon type="Close" />
    </span>
  ),
};

const applyArgs = (argsProps: ArgsProps): ArgsProps => ({
  ...baseArgs,
  ...argsProps,
});

/**
 * Override for the `antd/notification` object with styled
 * variants of the default notifications.
 */
export const notification: NotificationInstance &
  Pick<NotificationApi, 'config'> = {
  success: (argsProps: ArgsProps) =>
    _notification.success(
      applyArgs({
        ...argsProps,
        icon: (
          <span className="anticon ant-notification-notice-icon-success">
            <Icon type="Checkmark" />
          </span>
        ),
      })
    ),
  info: (argsProps: ArgsProps) =>
    _notification.info(
      applyArgs({
        ...argsProps,
        icon: (
          <span className="anticon ant-notification-notice-icon-info">
            <Icon type="Info" />
          </span>
        ),
      })
    ),
  warning: (argsProps: ArgsProps) =>
    _notification.warning(
      applyArgs({
        ...argsProps,
        icon: (
          <span className="anticon ant-notification-notice-icon-warning">
            <Icon type="Warning" />
          </span>
        ),
      })
    ),
  error: (argsProps: ArgsProps) =>
    _notification.error(
      applyArgs({
        ...argsProps,
        icon: (
          <span className="anticon ant-notification-notice-icon-error">
            <Icon type="Error" />
          </span>
        ),
      })
    ),
  open: (argsProps: ArgsProps) => _notification.open(applyArgs(argsProps)),
  config: (...args) => _notification.config(...args),
};

export default notification;
