import React from 'react';
import { useAggregate, SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { Badge, Colors } from '@cognite/cogs.js';
import { formatNumber } from 'lib/utils/numbers';

type Props = {
  type: SdkResourceType;
  filter?: any;
};

export const CdfCount = ({ type, filter }: Props) => {
  const { data, isFetched, isError } = useAggregate(type, filter);
  if (isError) {
    return null;
  }
  if (isFetched && data && Number.isFinite(data?.count) && data?.count > 0) {
    return (
      <Badge
        text={formatNumber(data?.count)}
        background={Colors['greyscale-grey3'].hex()}
      />
    );
  }
  return null;
};
