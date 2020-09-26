import React from 'react';
import { Tag } from 'antd';
import { useQuery } from 'react-query';
import { CogFunction } from 'types';

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
      return 'pink';
    }
  }
};
export default function FunctionStatus({ id }: Props) {
  const { data: fn } = useQuery<CogFunction>(`/functions/${id}`);
  const status = fn?.status || 'unknown';

  return (
    <Tag color={getStatusColor(status)} style={{ marginLeft: '8px' }}>
      {status}
    </Tag>
  );
}
