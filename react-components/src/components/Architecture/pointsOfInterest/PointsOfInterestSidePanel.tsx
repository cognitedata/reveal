import { CollapsablePanel } from '@cognite/cogs.js';
import { type PropsWithChildren, type ReactNode, useContext } from 'react';
import styled from 'styled-components';
import { PointsOfInteresSidePanelContext } from './PointsOfInterestSidePanel.context';
import { useNullableCommandProperty } from '../hooks/useCommandProperty';

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
