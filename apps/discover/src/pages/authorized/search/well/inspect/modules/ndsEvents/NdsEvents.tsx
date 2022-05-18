import React from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';
import { Loading } from 'components/Loading';

import { NdsTable } from './table';
import { useNdsData } from './useNdsData';

const NdsEvents: React.FC = () => {
  const { data, isLoading } = useNdsData();

  if (isLoading) {
    return <Loading />;
  }

  if (isEmpty(data)) {
    return <EmptyState />;
  }

  return <NdsTable data={data} />;
};

export default NdsEvents;
