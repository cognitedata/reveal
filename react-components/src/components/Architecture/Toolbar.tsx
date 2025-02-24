/*!
 * Copyright 2024 Cognite AS
 */
import { ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useMemo, type ReactElement } from 'react';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { CommandButtons } from './CommandButtons';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type PopupStyle } from '../../architecture/base/domainObjectsHelpers/PopupStyle';
import { type PlacementType } from './types';
import { useSignalValue } from '@cognite/signals/react';

export const TopToolbar = (): ReactElement => {
  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const config = renderTarget.config;
  if (config === undefined) {
    return <></>;
  }
  const commands = useMemo(() => config.createTopToolbar(), [config]);
  if (commands.length === 0) {
    return <></>;
  }
  const style = config.createTopToolbarStyle();
  return <ToolbarContent commands={commands} style={style} />;
};

export const MainToolbar = (): ReactElement => {
  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const config = renderTarget.config;
  if (config === undefined) {
    return <></>;
  }
  const commands = useMemo(() => config.createMainToolbar(), [config]);
  if (commands.length === 0) {
    return <></>;
  }
  const style = config.createMainToolbarStyle();
  return <ToolbarContent commands={commands} style={style} />;
};

export const ActiveToolToolbar = (): ReactElement => {
  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const activeTool = useSignalValue(renderTarget.commandsController.activeToolSignal);
  if (activeTool === undefined) {
    return <></>;
  }
  const commands = activeTool.getToolbar();
  if (commands === undefined) {
    return <></>;
  }
  const style = activeTool.getToolbarStyle();
  return <ToolbarContent commands={commands} style={style} />;
};

const ToolbarContent = ({
  commands,
  style
}: {
  commands: Array<BaseCommand | undefined>;
  style: PopupStyle;
}): ReactElement => {
  //
  if (commands.length === 0) {
    return <></>;
  }
  const placement = getPlacement(style);
  return (
    <Container
      style={{
        left: style.leftPx,
        right: style.rightPx,
        top: style.topPx,
        bottom: style.bottomPx,
        margin: style.marginPx
      }}>
      <MyCustomToolbar
        style={{
          flexFlow: style.flexFlow,
          padding: 2
        }}>
        <CommandButtons commands={commands} placement={placement} />
      </MyCustomToolbar>
    </Container>
  );
};

function getPlacement(style: PopupStyle): PlacementType {
  if (style.isHorizontal) {
    return style.top !== undefined ? 'top' : 'bottom';
  }
  return style.left !== undefined ? 'left' : 'right';
}

const Container = styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
`;

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))``;
export { CommandButtons };
