// @ts-nocheck
import React from 'react';
import {
  DateRange,
  Tooltip as CogsTooltip,
  Modal as CogsModal,
} from '@cognite/cogs.js';
import { getContainer } from '@extraction-pipelines/utils/utils';
import { styleScope } from '@extraction-pipelines/styles/styleScope';
import { Select, notification } from 'antd';

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

export default function AppScopeStyles(props: { children: React.Node }) {
  return <div className={styleScope}>{props.children}</div>;
}
