/*!
 * Copyright 2024 Cognite AS
 */
import { ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { type ReactElement } from 'react';
import { withCameraStateUrlParam } from '../../higher-order-components/withCameraStateUrlParam';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { CommandButton } from './CommandButton';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';

export const ExtraToolbar = (): ReactElement => {
  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const activeTool = renderTarget.toolController.activeTool;
  if (activeTool === undefined) {
    return <></>;
  }
  const commands = activeTool.getExtraToolbar();
  if (commands === undefined || commands.length === 0) {
    return <></>;
  }
  const style = activeTool.getExtraToolbarStyle();
  return (
    <Container
      style={{
        left: style.leftPx,
        right: style.rightPx,
        top: style.topPx,
        bottom: style.bottomPx,
        margin: style.marginPx
        // Padding is not used here
      }}>
      <MyCustomToolbar>
        <>{commands.map((command, _i): ReactElement => addCommand(command))}</>
      </MyCustomToolbar>
    </Container>
  );
};

function addCommand(command: BaseCommand | undefined): ReactElement {
  if (command === undefined) {
    return <>|</>;
  }
  return CommandButton(command);
}

const Container = styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
`;

const MyCustomToolbar = styled(withSuppressRevealEvents(withCameraStateUrlParam(ToolBar)))`
  flex-direction: row;
`;
