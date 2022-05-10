import { Button } from '@cognite/cogs.js';

import * as Styled from './style';

type ExportBarProps = {
  equipmentIds?: string[];
  onUnselect: () => void;
};

export const ExportBar = ({
  equipmentIds = [],
  onUnselect,
}: ExportBarProps) => {
  const onExport = () => {
    console.log('onExport');
  };

  return (
    <Styled.Container>
      <Styled.Label>
        {equipmentIds?.length === 1
          ? '1 equipment selected'
          : `${equipmentIds?.length} equipments selected`}
      </Styled.Label>
      <Styled.Actions>
        <Button
          icon="Export"
          iconPlacement="left"
          variant="inverted"
          onClick={onExport}
          style={{ border: '1px solid white' }}
        >
          Export
        </Button>
        <Button
          icon="Close"
          aria-label="Unselect data-fields"
          variant="inverted"
          onClick={onUnselect}
        />
      </Styled.Actions>
    </Styled.Container>
  );
};
