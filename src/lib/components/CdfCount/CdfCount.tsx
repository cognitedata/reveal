import React from 'react';
import { useAggregate, SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { Badge, Colors } from '@cognite/cogs.js';

type Props = {
  type: SdkResourceType;
  filter?: any;
};

export const CdfCount = ({ type, filter }: Props) => {
  const { data, isFetched, isError } = useAggregate(type, filter);
  if (isError) {
    return null;
  }
  if (isFetched && data && data?.count > 0) {
    return (
      <Badge
        text={`${data?.count}`}
        background={Colors['greyscale-grey3'].hex()}
      />
    );
  }
  return null;
};
