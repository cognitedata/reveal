import { ConfigProvider, notification } from 'antd';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Loader, Tooltip as CogsTooltip, Modal } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';

import { getContainer } from '../utils';

import antdTheme from './antd-theme.less';
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { styleScope } from './styleScope';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

Modal.defaultProps = {
  getContainer,
  ...Modal.defaultProps,
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
