import { CollapsablePanel } from '@cognite/cogs.js';
import { type PropsWithChildren, type ReactNode, useContext, useState } from 'react';
import styled from 'styled-components';
import { useOnUpdate } from '../hooks/useOnUpdate';
import { PointsOfInteresSidePanelContext } from './PointsOfInterestSidePanel.context';
import { usePointsOfInterestTool } from './usePointsOfInterestTool';
import { useCommandProperty, useNullableCommandProperty } from '../hooks/useCommandProperty';
import { useCommand } from '../hooks/useCommand';

export const PointsOfInterestSidePanel = ({ children }: PropsWithChildren): ReactNode => {
  const { useSelectedPoi, usePointsOfInterestTool, PoiList, PoiInfoPanelContent } = useContext(
    PointsOfInteresSidePanelContext
  );

  const tool = usePointsOfInterestTool();

  const selectedPoi = useSelectedPoi();

  const isOpen = useNullableCommandProperty(tool, () =>
    tool !== undefined ? tool.isChecked && tool.isEnabled : false
  );

  return (
    <CollapsablePanel
      sidePanelRightVisible={isOpen ?? false}
      sidePanelRightWidth={500}
      sidePanelRight={
        <PanelContentContainer>
          {selectedPoi !== undefined ? <PoiInfoPanelContent /> : <PoiList />}
        </PanelContentContainer>
      }>
      {children}
    </CollapsablePanel>
  );
};

const PanelContentContainer = styled.div`
  padding: 8px;
`;
