import { Loader, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';
import allotmentStyles from 'allotment/dist/style.css';

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
  const didLoadStyles = useGlobalStyles([cogsStyles, allotmentStyles]);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return <div className={styleScope}>{props.children}</div>;
}
