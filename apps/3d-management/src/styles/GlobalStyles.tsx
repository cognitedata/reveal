import antdTableStyles from 'styles/antd/antdTableStyles';
import antdGlobalStyles from 'styles/antd/antdGlobalStyles';
import React from 'react';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { getContainer } from 'utils';
import { styleScope } from 'utils/styleScope';
import { ConfigProvider } from 'antd';
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
