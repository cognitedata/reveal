import { useEffect, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useHomePageContext } from 'hooks';
import { PAGES } from 'pages/Menubar';
import { Facility } from 'types';

import { FacilityNavigation } from './FacilityNavigation';
import * as Styled from './style';
import { UnitNavigation } from './UnitNavigation';

export const Navigation = () => {
  const history = useHistory();
  const { homePageState } = useHomePageContext();
  const [isFacilityNavigation, setIsFacilityNavigation] = useState(false);

  const setFacility = (facility: Facility) => {
    if (homePageState.facility?.sequenceNumber !== facility.sequenceNumber) {
      history.replace(
        generatePath(PAGES.FACILITY, {
          facility: facility.path,
        })
      );
    } else {
      setIsFacilityNavigation(false);
    }
  };

  useEffect(() => {
    setIsFacilityNavigation(false);
  }, [homePageState.facility]);

  return (
    <Styled.Container>
      {isFacilityNavigation ? (
        <FacilityNavigation onChange={setFacility} />
      ) : (
        <UnitNavigation showFacilities={() => setIsFacilityNavigation(true)} />
      )}
    </Styled.Container>
  );
};
