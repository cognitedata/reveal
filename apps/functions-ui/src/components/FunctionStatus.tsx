import React from 'react';

import LoadingIcon from '@functions-ui/components/LoadingIcon';
import { useFunction } from '@functions-ui/utils/hooks';
import { Tag } from 'antd';

type Props = {
  id: number;
};
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ready': {
      return 'green';
    }
    case 'Queued': {
      return 'blue';
    }
    case 'Deploy': {
      return 'blue';
    }
    case 'Failed': {
      return 'red';
    }
    default: {
      return '';
    }
  }
};

export default function FunctionStatus({ id }: Props) {
  const { data: fn } = useFunction(id);
  const status = fn?.status;
  if (!status) {
    return <LoadingIcon />;
  }
  return (
    <Tag color={getStatusColor(status)} style={{ marginLeft: '8px' }}>
      {status}
    </Tag>
  );
}
