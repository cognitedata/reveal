/*!
 * Copyright 2024 Cognite AS
 */
import { ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { type ReactElement } from 'react';
import { withCameraStateUrlParam } from '../../../higher-order-components/withCameraStateUrlParam';
import { withSuppressRevealEvents } from '../../../higher-order-components/withSuppressRevealEvents';
import { type ActiveToolInfo } from '../../../architecture/base/domainObjectsHelpers/ExtraToolbarUpdater';
import { CommandButton } from './CommandButton';

const MyCustomToolbar = styled(withSuppressRevealEvents(withCameraStateUrlParam(ToolBar)))`
  position: absolute;
  right: 20px;
  top: 70px;
  flex-direction: row;
`;

export const ExtraToolbar = ({
  activeToolInfo
}: {
  activeToolInfo: ActiveToolInfo | undefined;
}): ReactElement => {
  if (activeToolInfo === undefined) {
    return <></>;
  }
  const activeTool = activeToolInfo.activeTool;
  if (activeTool === undefined) {
    return <></>;
  }
  const commands = activeTool.getExtraToolbar();
  if (commands === undefined || commands.length === 0) {
    return <></>;
  }
  return (
    <PanelContainer>
      <MyCustomToolbar>
        <>
          {commands.map((command, _i): ReactElement => {
            if (command === undefined) {
              return <>|</>;
            }
            return CommandButton(command);
          })}
        </>
      </MyCustomToolbar>
    </PanelContainer>
  );
};

const PanelContainer = styled.div`
  zindex: 1000px;
  bottom: 140px;
  right: 150px;
  position: absolute;
  display: block;
`;
