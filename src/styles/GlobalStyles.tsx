import { Loader, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';
import allotmentStyles from 'allotment/dist/style.css';
import { ConfigProvider } from 'antd';

import { getContainer } from 'utils';
import { styleScope } from 'styles/styleScope';

import antdTheme from './antd-theme.less';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const didLoadStyles = useGlobalStyles([
    cogsStyles,
    antdTheme,
    allotmentStyles,
  ]);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
