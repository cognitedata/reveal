/*!
 * Copyright 2024 Cognite AS
 */
import { ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useMemo, useState, type ReactElement } from 'react';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { CommandButtons } from './CommandButtons';
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
  const commands = useMemo(() => config.createMainToolbar(), [config]);
  if (commands.length === 0) {
    return <></>;
  }
  const style = config.createMainToolbarStyle();
  return <ToolbarContent commands={commands} style={style} />;
};

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
  const commands = useMemo(() => activeTool.getToolbar(), [activeTool]);
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
        <CommandButtons commands={commands} isHorizontal={style.isHorizontal} />
      </MyCustomToolbar>
    </Container>
  );
};

const Container = styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
`;

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))``;
export { CommandButtons };
