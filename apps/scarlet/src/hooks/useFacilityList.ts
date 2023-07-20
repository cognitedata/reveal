import { useMemo } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { useAppContext } from 'hooks';

export const useFacilityList = () => {
  const { client } = useAuthContext();
  const { appState } = useAppContext();

  const facility = useMemo(() => {
    if (!appState.facilityList?.data) return null;
    return appState.facilityList.data;
  }, [appState.facilityList, client?.project]);

  return facility;
};
