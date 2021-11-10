import { Icon } from '@cognite/cogs.js';
import { Controls, ControlButton, useZoomPanHelper } from 'react-flow-renderer';
import styled from 'styled-components/macro';

const CustomControls = () => {
  const { fitView, zoomIn, zoomOut } = useZoomPanHelper();
  return (
    <CustomControlButtonGroup
      showZoom={false}
      showFitView={false}
      showInteractive={false}
    >
      <CustomControlButton onClick={zoomIn}>
        <Icon type="ZoomIn" />
      </CustomControlButton>
      <CustomControlButton onClick={zoomOut}>
        <Icon type="ZoomOut" />
      </CustomControlButton>
      <CustomControlButton onClick={() => fitView({ padding: 0.2 })}>
        <Icon type="ExpandMax" />
      </CustomControlButton>
    </CustomControlButtonGroup>
  );
};

const CustomControlButtonGroup = styled(Controls)`
  border-radius: 6px;
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

export default CustomControls;
