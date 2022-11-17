import React, { useEffect, useState } from 'react';
import { Loader, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { ConfigProvider } from 'antd';

import { getContainer } from 'utils/getContainer';
import { styleScope } from 'styles/styleScope';

import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import antTheme from './antd-theme.less';

// This will override the appendTo prop on all Tooltips used from cog
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const [didLoadStyles, setDidLoadStyles] = useState<boolean>(false);
  const styles = [cogsStyles, antTheme];

  useEffect(() => {
    styles.forEach((style) => style?.use && style.use());
    setDidLoadStyles(true);
    return () => styles.forEach((style) => style?.unuse && style.unuse());
  }, []);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
