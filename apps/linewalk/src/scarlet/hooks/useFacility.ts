import { useMemo } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { defaultFacility, facility as facilityConfig } from 'scarlet/config';
import { RoutePath } from 'scarlet/routes';

export const useFacility = () => {
  const { facility: facilityPath } = useParams<{ facility: string }>();
  const history = useHistory();

  const facility = useMemo(() => {
    const facility = facilityConfig.find(
      (facility) => facility.path === facilityPath
    );

    if (!facility) {
      history.replace(
        generatePath(RoutePath.FACILITY, {
          facility: defaultFacility.path,
        })
      );
    }

    return facility;
  }, [facilityPath]);

  return facility;
};
