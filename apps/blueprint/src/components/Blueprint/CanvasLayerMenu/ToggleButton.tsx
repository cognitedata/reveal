import { Dropdown } from '@cognite/cogs.js';

import { ToggleMenu } from './ToggleMenu';
import * as S from './elements';

export type CanvasToggleLayerButtonProps = {
  handleToggleLayers: (layer: string, isVisible: boolean) => void;
};

export const ToggleButton: React.FC<CanvasToggleLayerButtonProps> = ({
  handleToggleLayers,
}) => {
  return (
    <S.CanvasToggleLayerDropdownWrapper>
      <Dropdown
        content={<ToggleMenu handleToggleLayers={handleToggleLayers} />}
        placement="auto-end"
      >
        <S.CanvasToggleLayerButtonWrapper type="ghost" icon="Layers" />
      </Dropdown>
    </S.CanvasToggleLayerDropdownWrapper>
  );
};
