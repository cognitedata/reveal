import React from 'react';
import { Tag } from 'antd';
import LoadingIcon from 'components/LoadingIcon';
import { useFunction } from 'utils/hooks';

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
