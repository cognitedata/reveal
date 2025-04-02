/*!
 * Copyright 2024 Cognite AS
 */
import { CollapsablePanel } from '@cognite/cogs.js';
import { type PropsWithChildren, type ReactNode, useState } from 'react';
import { useRenderTarget } from '../../RevealCanvas';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import styled from 'styled-components';
import { useOnUpdate } from '../useOnUpdate';
import { PoiInfoPanelContent } from './PoiInfoPanelContent';
import { PoiList } from './PoiList';
import { useSelectedPoi } from './useSelectedPoi';

export const PointsOfInterestSidePanel = ({ children }: PropsWithChildren): ReactNode => {
  const renderTarget = useRenderTarget();

  const tool = renderTarget.commandsController.getToolByType(PointsOfInterestTool);

  const [enabled, setEnabled] = useState<boolean>(tool?.isEnabled ?? false);

  useOnUpdate(tool, () => {
    if (tool === undefined) {
      return;
    }
    console.log(tool.isChecked, tool.isEnabled);
    setEnabled(tool.isChecked && tool.isEnabled);
  });

  return (
    <CollapsablePanel
      sidePanelRightVisible={enabled}
      sidePanelRightWidth={500}
      sidePanelRight={<PanelContainer />}>
      {children}
    </CollapsablePanel>
  );
};

const PanelContainer = (): ReactNode => {
  return (
    <PanelContentContainer>
      <PanelContent />
    </PanelContentContainer>
  );
};

const PanelContent = (): ReactNode => {
  const selectedPoi = useSelectedPoi();
  if (selectedPoi !== undefined) {
    return <PoiInfoPanelContent />;
  } else {
    return <AllPoiInfoPanel />;
  }
};

const AllPoiInfoPanel = (): ReactNode => {
  return <PoiList />;
};

const PanelContentContainer = styled.div`
  padding: 8px;
`;
