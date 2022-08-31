// @ts-nocheck
import React from 'react';
import { DateRange, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { getContainer } from 'utils/utils';
import { styleScope } from 'styles/styleScope';

CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

DateRange.defaultProps = {
  ...DateRange.defaultProps,
  getContainer,
};

export default function AppScopeStyles(props: { children: React.Node }) {
  return <div className={styleScope}>{props.children}</div>;
}
