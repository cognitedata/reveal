import { Loader, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';

import antdTheme from './antd-theme.less';

import { getContainer } from 'utils';
import { styleScope } from 'styles/styleScope';
import { ConfigProvider, notification } from 'antd';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

notification.config({
  getContainer,
});

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const didLoadStyles = useGlobalStyles([cogsStyles, antdTheme]);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
