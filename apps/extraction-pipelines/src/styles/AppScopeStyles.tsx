// @ts-nocheck
import { ids } from 'cogs-variables';
import React from 'react';
import { DateRange, Tooltip as CogsTooltip } from '@cognite/cogs.js';

CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: () => document.getElementsByClassName(ids.styleScope).item(0)!,
};

DateRange.defaultProps = {
  // @ts-ignore
  ...DateRange.defaultProps,
  getContainer: () => document.getElementsByClassName(ids.styleScope).item(0)!,
};

export default function AppScopeStyles(props: { children: React.Node }) {
  return <div className="integrations-ui-style-scope">{props.children}</div>;
}
