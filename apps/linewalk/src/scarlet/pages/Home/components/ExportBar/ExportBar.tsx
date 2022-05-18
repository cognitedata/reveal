import { Button } from '@cognite/cogs.js';
import { useHomePageContext } from 'scarlet/hooks';
import { HomePageActionType } from 'scarlet/types';

import * as Styled from './style';

export const ExportBar = () => {
  const { homePageState, homePageDispatch } = useHomePageContext();
  const { selectedEquipmentIds } = homePageState;

  const onExport = () => {
    homePageDispatch({
      type: HomePageActionType.EXPORT_EQUIPMENTS,
      isExportSelectedEquipments: true,
    });
  };

  const onClose = () => {
    homePageDispatch({
      type: HomePageActionType.SELECT_EQUIPMENTS,
      selectedEquipmentIds: [],
    });
  };

  if (!selectedEquipmentIds.length) return null;

  return (
    <Styled.Container>
      <Styled.Label>
        {selectedEquipmentIds?.length} equipment selected
      </Styled.Label>
      <Styled.Actions>
        <Button
          icon="Export"
          iconPlacement="left"
          type="secondary"
          onClick={onExport}
          style={{ border: '1px solid white' }}
        >
          Export
        </Button>
        <Button
          icon="Close"
          aria-label="Unselect data-fields"
          variant="inverted"
          onClick={onClose}
        />
      </Styled.Actions>
    </Styled.Container>
  );
};
