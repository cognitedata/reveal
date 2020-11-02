import { useMemo } from 'react';
import { Integration } from '../model/Integration';

export const useIntegrationTableDataSource = (data: Integration[]) => {
  return useMemo(() => {
    return data;
  }, [data]);
};
