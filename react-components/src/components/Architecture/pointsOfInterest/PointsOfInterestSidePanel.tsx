/*!
 * Copyright 2024 Cognite AS
 */
import { Button, CollapsablePanel, Drawer, PlusIcon } from '@cognite/cogs.js';
import { type PropsWithChildren, type ReactElement, useEffect, useMemo, useState } from 'react';
import { useRenderTarget } from '../../RevealCanvas';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { type PointOfInterest } from '../../../architecture/concrete/pointsOfInterest/types';
import { getDefaultCommand } from '../utilities';
import { BaseCommand, BaseTool, type Changes } from '../../../architecture';
import styled from 'styled-components';
import { useOnUpdate, useOnUpdateDomainObject } from '../useOnUpdate';
import { PointsOfInterestDomainObject } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestDomainObject';
import { PoIInfoPanelContent } from './PoIInfoPanelContent';
import { PoiList } from './PoIList';

export const PointsOfInterestSidePanel = ({ children }: PropsWithChildren<{}>): ReactElement => {
  const renderTarget = useRenderTarget();

  const poiTool = useMemo(
    () => getDefaultCommand(new PointsOfInterestTool(), renderTarget),
    [renderTarget]
  );

  const [enabled, setEnabled] = useState<boolean>(poiTool.isEnabled);
  const [poiObject, setPoiObject] = useState<PointsOfInterestDomainObject<any> | undefined>(
    poiTool.getPointsOfInterestDomainObject()
  );

  useOnUpdate(poiTool, () => {
    setPoiObject(poiTool.getPointsOfInterestDomainObject());
    setEnabled(renderTarget.commandsController.activeTool === poiTool && poiTool.isEnabled);
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

const PanelContainer = ({ poiObject }: { poiObject?: PointsOfInterestDomainObject<any> }) => {
  if (poiObject === undefined) {
    return poiObject;
  }

  return (
    <PanelContentContainer>
      <PanelContent poiObject={poiObject} />
    </PanelContentContainer>
  );
};

const PanelContent = ({ poiObject }: { poiObject: PointsOfInterestDomainObject<any> }) => {
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

const AllPoIInfoPanel = ({ poiObject }: { poiObject: PointsOfInterestDomainObject<any> }) => {
  return (
    <>
      <PoiList poiObject={poiObject} />
    </>
  );
};

const PanelContentContainer = styled.div`
  padding: 8px;
`;
