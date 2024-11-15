/*!
 * Copyright 2024 Cognite AS
 */
import { CollapsablePanel } from '@cognite/cogs.js';
import { type PropsWithChildren, type ReactElement, type ReactNode, useState } from 'react';
import { useRenderTarget } from '../../RevealCanvas';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { type PointOfInterest } from '../../../architecture/concrete/pointsOfInterest/types';
import styled from 'styled-components';
import { useOnUpdate, useOnUpdateDomainObject } from '../useOnUpdate';
import { type PointsOfInterestDomainObject } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestDomainObject';
import { PoIInfoPanelContent } from './PoIInfoPanelContent';
import { PoIList } from './PoIList';
import { useSelectedPoI } from './useSelectedPoI';

export const PointsOfInterestSidePanel = ({ children }: PropsWithChildren): ReactNode => {
  const renderTarget = useRenderTarget();

  const tool = renderTarget.commandsController.getToolByType(PointsOfInterestTool);

  const [enabled, setEnabled] = useState<boolean>(tool?.isEnabled ?? false);

  useOnUpdate(tool, () => {
    if (tool === undefined) {
      return;
    }

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

const PanelContent = (): ReactElement => {
  const selectedPoI = useSelectedPoI();
  if (selectedPoI !== undefined) {
    return <PoIInfoPanelContent />;
  } else {
    return <AllPoIInfoPanel />;
  }
};

const AllPoIInfoPanel = (): ReactElement => {
  return <PoIList />;
};

const PanelContentContainer = styled.div`
  padding: 8px;
`;
