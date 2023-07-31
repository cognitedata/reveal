import * as React from 'react';

import { Loading } from 'components/Loading';

import { useMapConfigSetupStatus } from './hooks/useMapConfigSetupStatus';
import { MapConfigEdit } from './MapConfigEdit';
import { MapConfigSetup } from './MapConfigSetup';

export const MapConfig: React.FC = () => {
  const { data, isLoading } = useMapConfigSetupStatus();

  if (isLoading) {
    return <Loading />;
  }

  if (data.missing.length === 0) {
    return <MapConfigEdit />;
  }

  return <MapConfigSetup found={data.found} missing={data.missing} />;
};
