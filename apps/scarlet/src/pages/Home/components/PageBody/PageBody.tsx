import { useEffect } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom-v5';
import { getUnitListByFacility } from 'api';
import {
  useApi,
  useAppContext,
  useFacility,
  useFacilityList,
  useHomePageContext,
} from 'hooks';
import { PAGES } from 'pages/Menubar';
import { getFacilityAssets } from 'api/getFacilityAssets';

import { EquipmentList, Navigation } from '..';
import * as types from '../EquipmentList/types';

import * as Styled from './style';

export const PageBody = () => {
  const history = useHistory();
  const { unitId } = useParams<{ unitId: string }>();
  const facility = useFacility();
  const facilityList = useFacilityList();
  const { homePageState, homePageDispatch } = useHomePageContext();
  const { appState, appDispatch } = useAppContext();

  const { state: facilityListQuery } = useApi(
    getFacilityAssets,
    {},
    appState.facilityList
  );

  const { state: unitListByFacilityQuery } = useApi(
    getUnitListByFacility,
    {
      facilityList,
    },
    appState.unitListByFacility
  );
  useEffect(() => {
    if (!appState.facilityList.data) {
      appDispatch({
        type: types.AppActionType.INIT_FACILITY_LIST,
        facilityList: facilityListQuery,
      });
    }

    homePageDispatch({
      type: types.HomePageActionType.SET_FACILITY_LIST,
      facilityListQuery,
    });
  }, [facilityListQuery]);

  useEffect(() => {
    if (facility) {
      homePageDispatch({
        type: types.HomePageActionType.SET_FACILITY,
        facility,
        unitId,
      });
    } else {
      if (!appState.facilityList.data) return;

      const defaultFacility: types.Facility = appState.facilityList.data[0];

      const facilityPath =
        localStorage?.getItem('scarlet_last_facility_path') ||
        defaultFacility.path;

      history.replace(
        generatePath(PAGES.FACILITY, {
          facility: facilityPath,
        })
      );
    }
  }, [appState.facilityList, facility]);

  useEffect(() => {
    if (!appState.facilityList.data) return;
    if (!facility) return;
    if (!appState.unitListByFacility.data) {
      appDispatch({
        type: types.AppActionType.INIT_UNITS,
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
      type: types.HomePageActionType.SET_UNIT_LIST,
      unitListQuery,
    });
  }, [homePageState.facilityListQuery, facility, unitListByFacilityQuery]);

  useEffect(() => {
    if (
      !appState.facilityList.data ||
      !homePageState.unitListQuery.data ||
      !facility
    )
      return;

    if (!homePageState.unitListQuery.data.length) return;

    if (
      unitId &&
      homePageState.unitListQuery.data.some((unit) => unit.id === unitId)
    ) {
      homePageDispatch({
        type: types.HomePageActionType.SET_UNIT,
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
  }, [appState.facilityList, facility, unitId, homePageState.unitListQuery]);

  if (!homePageState.facility) return null;

  return (
    <Styled.Container>
      <Navigation />
      <EquipmentList />
    </Styled.Container>
  );
};
