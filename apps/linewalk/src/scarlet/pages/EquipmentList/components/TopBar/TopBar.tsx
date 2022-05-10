import { Button, Icon } from '@cognite/cogs.js';
import { exportToExcel } from 'scarlet/api';
import { useCognitePlaygroundClient, useFacility } from 'scarlet/hooks';
import { getPrintedUnitName } from 'scarlet/utils';

import * as Styled from './style';

interface TopBarProps {
  unitId: string;
}

export const TopBar = ({ unitId }: TopBarProps) => {
  const cognitePlaygroundClient = useCognitePlaygroundClient();
  const facility = useFacility();

  return (
    <Styled.Container>
      <Styled.Content>
        <Styled.Plant className="cogs-micro">
          <Icon type="OilPlatform" /> {facility?.shortName} plant
        </Styled.Plant>
        <Styled.Unit className="cogs-title-3">
          {getPrintedUnitName(unitId)}
        </Styled.Unit>
      </Styled.Content>
      <Styled.Actions>
        <Button
          icon="Export"
          type="primary"
          iconPlacement="left"
          onClick={() =>
            exportToExcel(cognitePlaygroundClient!, {
              facility,
              unitId,
            })
          }
        >
          Export all equipments
        </Button>
      </Styled.Actions>
    </Styled.Container>
  );
};
