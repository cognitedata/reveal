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
import { type PopupStyle } from '../../architecture/base/domainObjectsHelpers/PopupStyle';

export const MainToolbar = (): ReactElement => {
  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const config = renderTarget.config;
  if (config === undefined) {
    return <></>;
  }
  const commands = config.createMainToolbar();
  if (commands.length === 0) {
    return <></>;
  }
  const style = config.createMainToolbarStyle();
  return CreateToolToolbar(commands, style);
};

export const ActiveToolToolbar = (): ReactElement => {
  //
  const [_activeToolUpdater, setActiveToolUpdater] = useState<number>(0);
  ActiveToolUpdater.setCounterDelegate(setActiveToolUpdater);

  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const activeTool = renderTarget.commandsController.activeTool;
  if (activeTool === undefined) {
    return <></>;
  }
  const commands = activeTool.getToolbar();
  const style = activeTool.getToolbarStyle();
  return CreateToolToolbar(commands, style);
};

const CreateToolToolbar = (
  commands: Array<BaseCommand | undefined>,
  style: PopupStyle
): ReactElement => {
  //
  if (commands.length === 0) {
    return <></>;
  }
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
      <MyCustomToolbar
        style={{
          flexFlow: style.flexFlow
          // Padding is not used here
        }}>
        <>{commands.map((command, index): ReactElement => addCommand(command, style, index))}</>
      </MyCustomToolbar>
    </Container>
  );
};

function addCommand(
  command: BaseCommand | undefined,
  style: PopupStyle,
  index: number
): ReactElement {
  if (command === undefined) {
    const direction = style.isDividerHorizontal ? 'horizontal' : 'vertical';
    return <Divider key={index} weight="2px" length="75%" direction={direction} />;
  }
  return <CommandButton command={command} key={command.name} />;
}

const Container = styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
`;

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))``;
