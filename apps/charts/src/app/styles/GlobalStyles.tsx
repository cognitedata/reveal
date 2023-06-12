import React, { useEffect, useState } from 'react';

import { ConfigProvider } from 'antd';
// import antTheme from './antd-theme.less'; // The .less import did not work
import antTheme from 'antd/dist/antd.css';
import katexCss from 'katex/dist/katex.min.css';

import {
  Loader,
  Tooltip as CogsTooltip,
  Modal,
  DateRange,
} from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

//@ts-ignore
import styleScope from '../../styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope.styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};
// This will override the appendTo prop on all Tooltips used from cog
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

Modal.defaultProps = {
  // @ts-ignore
  ...Modal.defaultProps,
  getContainer,
};

// @ts-ignore
DateRange.defaultProps = {
  // @ts-ignore
  ...DateRange.defaultProps,
  getContainer: () => {
    return getContainer();
  },
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const [didLoadStyles, setDidLoadStyles] = useState<boolean>(false);
  const styles = [cogsStyles, antTheme, katexCss];

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
      <div className={styleScope.styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
