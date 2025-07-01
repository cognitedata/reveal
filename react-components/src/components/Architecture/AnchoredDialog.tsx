import { type ReactNode, useEffect, useMemo, useState } from 'react';
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
  const activeTool = renderTarget.commandsController.activeTool;
  const dialogContent = useMemo(() => activeTool?.getAnchoredDialogContent(), [activeToolUpdate]);
  const isSomeEnabled = dialogContent?.contentCommands.some((command) => command.isEnabled);

  useEffect(() => {
    dialogContent?.customListeners?.forEach((listener) => {
      window.addEventListener(listener.eventName, listener.callback, true);
    });
    return () => {
      dialogContent?.customListeners?.forEach((listener) => {
        window.removeEventListener(listener.eventName, listener.callback, true);
      });
    };
  }, [dialogContent]);

  if (dialogContent === undefined || isSomeEnabled !== true) {
    return undefined;
  }

  if (renderTarget === undefined || activeTool === undefined) {
    return <></>;
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
