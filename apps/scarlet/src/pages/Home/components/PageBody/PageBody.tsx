import { useEffect } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { getUnitListByFacility } from 'api';
import { defaultFacility } from 'config';
import { useApi, useAppContext, useFacility, useHomePageContext } from 'hooks';
import { PAGES } from 'pages/Menubar';

import { EquipmentList, Navigation } from '..';
import { AppActionType, HomePageActionType } from '../EquipmentList/types';

import * as Styled from './style';

export const PageBody = () => {
  const history = useHistory();
  const { unitId } = useParams<{ unitId: string }>();
  const facility = useFacility();
  const { homePageState, homePageDispatch } = useHomePageContext();
  const { appState, appDispatch } = useAppContext();

  const { state: unitListByFacilityQuery } = useApi(
    getUnitListByFacility,
    {},
    appState.unitListByFacility
  );

  useEffect(() => {
    if (facility) {
      homePageDispatch({
        type: HomePageActionType.SET_FACILITY,
        facility,
        unitId,
      });
    } else {
      const facilityPath =
        localStorage?.getItem('scarlet_last_facility_path') ||
        defaultFacility.path;

      history.replace(
        generatePath(PAGES.FACILITY, {
          facility: facilityPath,
        })
      );
    }
  }, [facility]);

  useEffect(() => {
    if (!facility) return;
    if (!appState.unitListByFacility.data) {
      appDispatch({
        type: AppActionType.INIT_UNITS,
        unitListByFacility: unitListByFacilityQuery,
      });
    }

    const unitListQuery = {
      ...unitListByFacilityQuery,
      data: unitListByFacilityQuery.data?.[facility.id].sort(
        (a, b) => a.number - b.number
      ),
    };

    homePageDispatch({
      type: HomePageActionType.SET_UNIT_LIST,
      unitListQuery,
    });
  }, [facility, unitListByFacilityQuery]);

  useEffect(() => {
    if (!homePageState.unitListQuery.data || !facility) return;

    if (!homePageState.unitListQuery.data.length) return;

    if (
      unitId &&
      homePageState.unitListQuery.data.some((unit) => unit.id === unitId)
    ) {
      homePageDispatch({
        type: HomePageActionType.SET_UNIT,
        unitId,
      });
    } else if (homePageState.facility === facility) {
      const firstUnit = homePageState.unitListQuery.data.length
        ? homePageState.unitListQuery.data[0]
        : undefined;

      if (firstUnit) {
        history.replace(
          generatePath(PAGES.UNIT, {
            facility: facility.path,
            unitId: firstUnit.id,
          })
        );
      }
    }
  }, [facility, unitId, homePageState.unitListQuery]);

  if (!homePageState.facility) return null;

  return (
    <Styled.Container>
      <Navigation />
      <EquipmentList />
    </Styled.Container>
  );
};
