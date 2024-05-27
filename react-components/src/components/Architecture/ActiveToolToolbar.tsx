/*!
 * Copyright 2024 Cognite AS
 */
import { Divider, ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useState, type ReactElement } from 'react';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { CommandButton } from './CommandButton';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { ActiveToolUpdater } from '../../architecture/base/reactUpdaters/ActiveToolUpdater';

export const ActiveToolToolbar = (): ReactElement => {
  const [_activeToolUpdater, setActiveToolUpdater] = useState<number>(0);
  ActiveToolUpdater.setCounterDelegate(setActiveToolUpdater);

  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const activeTool = renderTarget.toolController.activeTool;
  if (activeTool === undefined) {
    return <></>;
  }
  const commands = activeTool.getToolbar();
  if (commands === undefined || commands.length === 0) {
    return <></>;
  }
  const style = activeTool.getToolbarStyle();
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
        <>{commands.map((command, index): ReactElement => addCommand(command, index))}</>
      </MyCustomToolbar>
    </Container>
  );
};

function addCommand(command: BaseCommand | undefined, index: number): ReactElement {
  if (command === undefined) {
    return <Divider key={index} weight="2px" length="75%" direction="vertical" />;
  }
  return <CommandButton command={command} key={index} />;
}

const Container = styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
`;

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))`
  flex-direction: row;
`;
