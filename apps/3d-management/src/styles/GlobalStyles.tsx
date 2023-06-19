import React from 'react';

import { ConfigProvider } from 'antd';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import { getContainer } from '../utils';
import { styleScope } from '../utils/styleScope';

import antdGlobalStyles from './antd/antdGlobalStyles';
import antdTableStyles from './antd/antdTableStyles';
import appGlobalStyles from './global.css';

export default function AntStyles(props: React.PropsWithChildren<any>) {
  useGlobalStyles([
    appGlobalStyles,
    cogsStyles,
    ...antdGlobalStyles,
    ...antdTableStyles,
  ]);

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
