import React from 'react';
import { useAggregate, SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { Badge } from '@cognite/cogs.js';
import { formatNumber } from 'utils/numbers';
import { lightGrey } from 'utils/Colors';

type Props = {
  type: SdkResourceType;
  filter?: any;
};

export const CdfCount = ({ type, filter }: Props) => {
  const { data, isFetched } = useAggregate(type, filter);
  if (isFetched && data && Number.isFinite(data?.count) && data?.count > 0) {
    return <Badge text={formatNumber(data?.count)} background={lightGrey} />;
  }

  return null;
};
