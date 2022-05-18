import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { facilityList } from 'scarlet/config';

export const useFacility = () => {
  const params = useParams<{ facility: string }>();

  const facility = useMemo(
    () => facilityList.find((facility) => facility.path === params.facility),
    [params.facility]
  );

  return facility;
};
