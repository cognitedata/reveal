import { ReactNode, useMemo, useState } from 'react';
import { useRenderTarget } from '../RevealCanvas';
import { AnchoredDialogUpdater } from '../../architecture/base/reactUpdaters/AnchoredDialogUpdater';
import { ViewerAnchor } from '../ViewerAnchor/ViewerAnchor';
import { Menu } from '@cognite/cogs.js';
import { createButton } from './CommandButtons';
import styled from 'styled-components';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';

export const AnchoredDialog = (): ReactNode => {
  const [activeToolUpdate, setActiveToolUpdater] = useState<number>(0);

  AnchoredDialogUpdater.setCounterDelegate(setActiveToolUpdater);

  const renderTarget = useRenderTarget();
  if (renderTarget === undefined) {
    return <></>;
  }
  const activeTool = renderTarget.commandsController.activeTool;
  if (activeTool === undefined) {
    return <></>;
  }

  const dialogContent = useMemo(() => activeTool.getAnchoredDialogContent(), [activeToolUpdate]);
  const isSomeEnabled = dialogContent?.contentCommands.some((command) => command.isEnabled);

  if (dialogContent === undefined || isSomeEnabled !== true) {
    return undefined;
  }

  return (
    <ViewerAnchor position={dialogContent?.position}>
      <SuppressedMenu>
        {dialogContent.contentCommands.map((command) => createButton(command, 'right'))}
      </SuppressedMenu>
    </ViewerAnchor>
  );
};

const SuppressedMenu = withSuppressRevealEvents(styled(Menu)`
  background-color: white;
`);
