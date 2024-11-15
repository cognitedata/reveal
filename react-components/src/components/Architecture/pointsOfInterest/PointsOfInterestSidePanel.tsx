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

export const PointsOfInterestSidePanel = ({ children }: PropsWithChildren): ReactNode => {
  const renderTarget = useRenderTarget();

  const tool = renderTarget.commandsController.getToolByType(PointsOfInterestTool);

  const [enabled, setEnabled] = useState<boolean>(tool?.isEnabled ?? false);
  const [poiObject, setPoiObject] = useState<PointsOfInterestDomainObject<any> | undefined>(
    tool?.getPointsOfInterestDomainObject()
  );

  useOnUpdate(tool, () => {
    if (tool === undefined) {
      return;
    }

    setPoiObject(tool.getPointsOfInterestDomainObject());
    setEnabled(tool.isChecked && tool.isEnabled);
  });

  return (
    <CollapsablePanel
      sidePanelRightVisible={enabled}
      sidePanelRightWidth={500}
      sidePanelRight={<PanelContainer poiObject={poiObject} />}>
      {children}
    </CollapsablePanel>
  );
};

const PanelContainer = ({
  poiObject
}: {
  poiObject?: PointsOfInterestDomainObject<any>;
}): ReactNode => {
  if (poiObject === undefined) {
    return null;
  }

  return (
    <PanelContentContainer>
      <PanelContent poiObject={poiObject} />
    </PanelContentContainer>
  );
};

const PanelContent = ({
  poiObject
}: {
  poiObject: PointsOfInterestDomainObject<any>;
}): ReactElement => {
  const [selectedPoI, setSelectedPoI] = useState<PointOfInterest<any> | undefined>(
    poiObject.selectedPointsOfInterest
  );

  useOnUpdateDomainObject(poiObject, () => {
    setSelectedPoI(poiObject.selectedPointsOfInterest);
  });

  if (selectedPoI !== undefined) {
    return <PoIInfoPanelContent poiObject={poiObject} />;
  } else {
    return <AllPoIInfoPanel poiObject={poiObject} />;
  }
};

const AllPoIInfoPanel = ({
  poiObject
}: {
  poiObject: PointsOfInterestDomainObject<any>;
}): ReactElement => {
  return <PoIList />;
};

const PanelContentContainer = styled.div`
  padding: 8px;
`;
