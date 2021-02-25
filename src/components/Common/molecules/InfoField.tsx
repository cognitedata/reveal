import React from 'react';
import { Card } from 'antd';
import { Icon } from '@cognite/cogs.js';

const bodyStyle = {
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
};

type InfoFieldProps = {
  content: string | React.ReactNode;
};
export function InfoField(props: InfoFieldProps) {
  const { content } = props;
  return (
    <Card bodyStyle={bodyStyle}>
      <Icon type="Info" style={{ marginRight: '12px' }} />
      {content}
    </Card>
  );
}
