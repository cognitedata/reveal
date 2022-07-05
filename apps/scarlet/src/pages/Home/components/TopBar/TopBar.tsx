import { Button, Icon, Skeleton } from '@cognite/cogs.js';
import { useHomePageContext } from 'hooks';
import { getPrintedUnitName } from 'utils';
import { HomePageActionType } from 'types';

import * as Styled from './style';

export const TopBar = () => {
  const { homePageState, homePageDispatch } = useHomePageContext();
  const { facility, unitId } = homePageState;
  const { loading } = homePageState.unitListQuery;

  const onExport = () => {
    homePageDispatch({
      type: HomePageActionType.EXPORT_EQUIPMENTS,
      isExportSelectedEquipments: false,
    });
  };

  return (
    <Styled.Container>
      <Styled.Content>
        <Styled.Plant className="cogs-micro">
          <Icon type="OilPlatform" /> {facility?.shortName} plant
        </Styled.Plant>
        <Styled.Unit className="cogs-title-3">
          {!loading && unitId
            ? getPrintedUnitName(unitId, facility?.unitPattern)
            : ''}
          {loading && (
            <Skeleton.Rectangle
              width="120px"
              height="24px"
              style={{ margin: '4px 0', display: 'block' }}
            />
          )}
        </Styled.Unit>
      </Styled.Content>
      {unitId ? (
        <Styled.Actions>
          <Button
            icon="Export"
            type="primary"
            iconPlacement="left"
            onClick={onExport}
            disabled={
              homePageState.equipmentListQuery.loading ||
              homePageState.equipmentListQuery.error
            }
          >
            Export all equipment
          </Button>
        </Styled.Actions>
      ) : null}
    </Styled.Container>
  );
};
