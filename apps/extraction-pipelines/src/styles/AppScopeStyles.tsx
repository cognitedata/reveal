// @ts-nocheck
import React from 'react';
import {
  DateRange,
  Tooltip as CogsTooltip,
  Modal as CogsModal,
} from '@cognite/cogs.js';
import { getContainer } from 'utils/utils';
import { styleScope } from 'styles/styleScope';
import { Select } from 'antd';

Select.defaultProps = {
  ...Select.defaultProps,
  getPopupContainer: getContainer,
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

export default function AppScopeStyles(props: { children: React.Node }) {
  return <div className={styleScope}>{props.children}</div>;
}
