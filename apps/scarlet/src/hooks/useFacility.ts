import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '@cognite/react-container';
import { facilityList } from 'config';

export const useFacility = () => {
  const { client } = useAuthContext();
  const params = useParams<{ facility: string }>();

  const facility = useMemo(
    () =>
      facilityList(client?.project || '').find(
        (facility) => facility.path === params.facility
      ),
    [params.facility, client?.project]
  );

  return facility;
};
