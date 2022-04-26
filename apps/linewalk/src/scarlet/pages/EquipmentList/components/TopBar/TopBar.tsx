import { Button, Icon } from '@cognite/cogs.js';
import { exportToExcel } from 'scarlet/api';
import { useCognitePlaygroundClient } from 'scarlet/hooks';
import { getPrintedUnitName } from 'scarlet/utils';

import * as Styled from './style';

interface TopBarProps {
  unitName: string;
}

export const TopBar = ({ unitName }: TopBarProps) => {
  const cognitePlaygroundClient = useCognitePlaygroundClient();

  return (
    <Styled.Container>
      <Styled.Content>
        <Styled.Plant className="cogs-micro">
          <Icon type="OilPlatform" /> Berger plant
        </Styled.Plant>
        <Styled.Unit className="cogs-title-3">
          {getPrintedUnitName(unitName)}
        </Styled.Unit>
      </Styled.Content>
      <Styled.Actions>
        <Button
          icon="Download"
          type="primary"
          iconPlacement="left"
          onClick={() => exportToExcel(cognitePlaygroundClient, unitName)}
        >
          Export all equipments
        </Button>
      </Styled.Actions>
    </Styled.Container>
  );
};
