import React from 'react';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import { getContainer } from 'utils';
import { styleScope } from 'styles/styleScope';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([cogsStyles]);

  // useGlobalStyles([antdStyle, cogsStyles]); // uncomment to add antd
  return <div className={styleScope}>{props.children}</div>;
}
