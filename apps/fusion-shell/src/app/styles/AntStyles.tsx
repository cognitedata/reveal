import React from 'react';

import { ConfigProvider } from 'antd';

import { getContainer } from '../utils/utils';

export default function AntStyles(props: { children: React.ReactNode }) {
  return (
    <ConfigProvider getPopupContainer={() => getContainer()}>
      <div className="navigation-style-scope">{props.children}</div>
    </ConfigProvider>
  );
}
