import React from 'react';
import { Tag } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import { Call } from 'types';
import { getCalls } from 'utils/api';
import FunctionCallStatus from './FunctionCallStatus';

type Props = {
  id: number;
};
export default function FunctionLastCallStatus({ id }: Props) {
  const { data: calls, isFetched } = useQuery<Call[]>(
    ['/functions/calls', { id }],
    getCalls
  );
  if (!isFetched) {
    return (
      <Tag>
        <Icon type="Loading" />
      </Tag>
    );
  }
  const callId = calls?.[0]?.id;

  return <FunctionCallStatus id={id} callId={callId} />;
}
