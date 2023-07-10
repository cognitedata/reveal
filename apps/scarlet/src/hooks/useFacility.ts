import { useMemo } from 'react';
import { useParams } from 'react-router-dom-v5';
import { useAuthContext } from '@cognite/react-container';
import { useAppContext } from 'hooks';

export const useFacility = () => {
  const { client } = useAuthContext();
  const params = useParams<{ facility: string }>();
  const { appState } = useAppContext();

  const facility = useMemo(() => {
    if (!appState.facilityList?.data) return null;
    const facilityList = appState.facilityList.data;
    return facilityList.find((facility) => facility.path === params.facility);
  }, [appState.facilityList, params.facility, client?.project]);

  return facility;
};
