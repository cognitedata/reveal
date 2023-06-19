// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';

import { Select, notification } from 'antd';

import {
  DateRange,
  Tooltip as CogsTooltip,
  Modal as CogsModal,
} from '@cognite/cogs.js';

import { styleScope } from '../styleScope';
import { getContainer } from '../utils/utils';

Select.defaultProps = {
  ...Select.defaultProps,
  getPopupContainer: getContainer,
};

CogsModal.defaultProps = {
  ...CogsModal.defaultProps,
  getContainer,
};

CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

DateRange.defaultProps = {
  ...DateRange.defaultProps,
  getContainer,
};

CogsModal.defaultProps = {
  ...CogsModal.defaultProps,
  getContainer,
};

notification.config({
  ...notification.defaultProps,
  getContainer,
});

export default function AppScopeStyles(props: { children: React.ReactNode }) {
  return <div className={styleScope}>{props.children}</div>;
}
