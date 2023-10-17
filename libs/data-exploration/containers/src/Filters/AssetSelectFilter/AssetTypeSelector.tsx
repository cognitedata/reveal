import { Ellipsis } from '@data-exploration/components';
import styled from 'styled-components/macro';

import {
  Icon,
  SegmentedControl,
  SegmentedControlButtonProps,
  Tooltip,
} from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { AssetFilterType } from '../types';

export interface AssetTypeSelectorProps {
  assetFilterType: AssetFilterType;
  onChange: (assetFilterType: AssetFilterType) => void;
}

export const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  assetFilterType,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <SegmentedControl fullWidth currentKey={assetFilterType}>
      <ControlButton
        key={AssetFilterType.AllLinked}
        text={t(AssetFilterType.AllLinked, 'Linked')}
        tooltip={t(
          'ASSET_FILTER_ALL_LINKED_TOOLTIP',
          'Filter by selected asset and all linked assets'
        )}
        onClick={() => onChange(AssetFilterType.AllLinked)}
      />
      <ControlButton
        key={AssetFilterType.DirectlyLinked}
        text={t(AssetFilterType.DirectlyLinked, 'Directly linked')}
        tooltip={t(
          'ASSET_FILTER_DIRECTLY_LINKED_TOOLTIP',
          'Filter by selected asset and directly linked assets'
        )}
        onClick={() => onChange(AssetFilterType.DirectlyLinked)}
      />
    </SegmentedControl>
  );
};

interface ControlButtonProps extends SegmentedControlButtonProps {
  key: AssetFilterType;
  text: string;
  tooltip: string;
  onClick: () => void;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  key,
  text,
  tooltip,
  onClick,
  ...props
}) => {
  /**
   * When the search input is focused,
   * both onButtonClicked in SegementedControl and onClick in SegmentedControl.Button
   * are not triggered on the first click since the search input is blurred for that click.
   * Hence, using onMouseDown for left click to trigger onClick.
   */
  const handleMouseDown = (event: React.MouseEvent) => {
    // Check if the left button is clicked
    if (event.button === 0) {
      onClick();
    }
  };

  return (
    <SegmentedControl.Button {...props} key={key} onMouseDown={handleMouseDown}>
      <ButtonContent>
        <ButtonText>
          <Ellipsis value={text} />
        </ButtonText>

        <Tooltip content={tooltip} wrapped>
          <StyledIcon type="Info" />
        </Tooltip>
      </ButtonContent>
    </SegmentedControl.Button>
  );
};

const ButtonContent = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  color: var(--cogs-text-icon--medium);
`;

const ButtonText = styled.span`
  max-width: 100px;
`;

const StyledIcon = styled(Icon)`
  margin-top: 6px;
`;
