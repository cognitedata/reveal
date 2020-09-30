import React from 'react';
import { useAggregate, SdkResourceType } from 'hooks/sdk';

type Props = {
  type: SdkResourceType;
  filter?: any;
};

export default function CdfCount({ type, filter }: Props) {
  const { data, isFetched } = useAggregate(type, filter);
  if (isFetched) {
    return <>{data?.count}</>;
  }
  return null;
}
