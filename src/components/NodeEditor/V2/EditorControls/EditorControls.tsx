import { Dropdown, Icon } from '@cognite/cogs.js';
import { useState } from 'react';
import { Controls, ControlButton, useZoomPanHelper } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import AutoAlignDropdown from './AutoAlignDropdown';

type EditorControlsProps = {
  autoAlign?: boolean;
  onToggleAutoAlign?: (autoAlign: boolean) => void;
};

const EditorControls = ({
  autoAlign,
  onToggleAutoAlign = () => {},
}: EditorControlsProps) => {
  const { fitView, zoomIn, zoomOut } = useZoomPanHelper();
  const [isAutoAlignDropdownVisible, setIsAutoAlignDropdownVisible] =
    useState<boolean>(false);

  return (
    <CustomControlButtonGroup
      showZoom={false}
      showFitView={false}
      showInteractive={false}
    >
      <CustomControlButton onClick={() => zoomIn()}>
        <Icon type="ZoomIn" />
      </CustomControlButton>
      <CustomControlButton onClick={() => zoomOut()}>
        <Icon type="ZoomOut" />
      </CustomControlButton>
      <CustomControlButton onClick={() => fitView({ padding: 0.2 })}>
        <Icon type="ExpandMax" />
      </CustomControlButton>

      <Dropdown
        content={
          <AutoAlignDropdown
            initialValue={autoAlign}
            saveAutoAlign={(val) => {
              onToggleAutoAlign(val);
              setIsAutoAlignDropdownVisible(false);
            }}
          />
        }
        visible={isAutoAlignDropdownVisible}
        onClickOutside={() => setIsAutoAlignDropdownVisible(false)}
        placement="right"
        arrow
      >
        <CustomControlButton
          onClick={() => setIsAutoAlignDropdownVisible((visible) => !visible)}
        >
          <Icon type="Configure" />
        </CustomControlButton>
      </Dropdown>
    </CustomControlButtonGroup>
  );
};

const CustomControlButtonGroup = styled(Controls)`
  border-radius: 6px;

  .tippy-arrow {
    color: #ffffff !important;
  }
`;

const CustomControlButton = styled(ControlButton)`
  width: 22px;
  height: 22px;

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`;

export default EditorControls;
