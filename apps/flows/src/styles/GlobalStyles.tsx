import { styleScope } from '@flows/styles/styleScope';
import { getContainer } from '@flows/utils';
import { ConfigProvider } from 'antd';
import reactFlowStyles from 'reactflow/dist/style.css';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Loader, Tooltip as CogsTooltip, Modal } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';

import antdTheme from './antd-theme.less';

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

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const didLoadStyles = useGlobalStyles([
    cogsStyles,
    antdTheme,
    reactFlowStyles,
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
