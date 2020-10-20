import React from 'react';
import { useAggregate, SdkResourceType } from 'lib/hooks/sdk';
import { Badge, Colors } from '@cognite/cogs.js';

type Props = {
  type: SdkResourceType;
  filter?: any;
};

export const CdfCount = ({ type, filter }: Props) => {
  const { data, isFetched } = useAggregate(type, filter);
  if (isFetched) {
    return (
      <Badge
        text={`${data?.count}`}
        background={Colors['greyscale-grey3'].hex()}
      />
    );
  }
  return null;
};
