import {
  Loader,
  Tooltip as CogsTooltip,
  Modal,
  Button as CogsButton,
} from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';
import { ConfigProvider } from 'antd';

import { getContainer } from 'utils';
import { styleScope } from 'styles/styleScope';

import antdTheme from './antd-theme.less';
import reactFlowStyles from 'reactflow/dist/style.css';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

CogsButton.defaultProps = {
  // @ts-ignore
  getContainer,
  ...CogsButton.defaultProps,
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
