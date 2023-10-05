import styled from 'styled-components';

import { ToolBar } from '@cognite/cogs.js';
import {
  RevealToolbar,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import {
  FLOATING_ELEMENT_MARGIN,
  HighQualitySettings,
  LowQualitySettings,
} from '../../../../../pages/ContextualizeEditor/constants';
import { useContextualizeThreeDViewerStore } from '../../../useContextualizeThreeDViewerStore';
import { ColorTypeSelector } from '../PointCloudColorPicker';
import { PointSizeSlider } from '../PointSizeSlider';

import { PointCloudToolBarTools } from './PointCloudToolBarTools';

type PointCloudToolBarProps = {
  onDeleteAnnotation: (annotationId: number) => void;
};

export const PointCloudToolBar = ({
  onDeleteAnnotation,
}: PointCloudToolBarProps) => {
  const { modelId } = useContextualizeThreeDViewerStore((state) => ({
    modelId: state.modelId,
  }));

  if (modelId === null) return null;

  return (
    <>
      <StyledToolBar>
        <RevealToolbar.FitModelsButton />
        <PointCloudToolBarTools onDeleteAnnotation={onDeleteAnnotation} />
        <RevealToolbar.SettingsButton
          customSettingsContent={
            <>
              <ColorTypeSelector />
              <PointSizeSlider />
            </>
          }
          lowQualitySettings={LowQualitySettings}
          highQualitySettings={HighQualitySettings}
        />
      </StyledToolBar>
      <InformationBox />
    </>
  );
};

const InformationBox = () => {
  const { tool, pendingAnnotation } = useContextualizeThreeDViewerStore(
    (state) => ({
      tool: state.tool,
      pendingAnnotation: state.pendingAnnotation,
    })
  );

  if (tool !== 'addAnnotation') return null;

  if (pendingAnnotation === null) {
    return (
      <StyledInformation left={75} bottom={85}>
        Click on the model
        <br />
        to add an annotation
      </StyledInformation>
    );
  }

  return (
    <StyledInformation left={75} bottom={85}>
      <p>
        Select an asset from
        <br />
        the right side panel
      </p>
    </StyledInformation>
  );
};

const StyledToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: ${FLOATING_ELEMENT_MARGIN}px;
  bottom: ${FLOATING_ELEMENT_MARGIN}px;
`;

const StyledInformation = styled.div<{ left: number; bottom: number }>`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 10px;
  left: ${(props) => props.left}px;
  bottom: ${(props) => props.bottom}px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 200px;
  color: white;
  pointer-events: none;
`;
