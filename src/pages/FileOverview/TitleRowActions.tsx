import { Space, Divider } from 'antd';
import React from 'react';

type TitleRowActionsProps = {
  actions?: React.ReactNode[] | React.ReactNode;
};

const TitleRowActions = ({ actions }: TitleRowActionsProps) => {
  return (
    <Space style={{ float: 'right' }}>
      <Divider type="vertical" style={{ height: '36px' }} />
      {actions}
    </Space>
  );
};

export default TitleRowActions;
