import { type ReactNode, useEffect } from 'react';
import { useRenderTarget } from '../RevealCanvas';
import { ViewerAnchor } from '../ViewerAnchor/ViewerAnchor';
import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { useSignalValue } from '@cognite/signals/react';
import { signal } from '@cognite/signals';
import { type AnchoredDialogContent } from '../../architecture/base/commands/BaseTool';
import { useComponentFactory } from '../RevealCanvas/ComponentFactoryContext';

const UNDEFINED_SIGNAL = signal<AnchoredDialogContent | undefined>();

export const AnchoredDialog = (): ReactNode => {
  const renderTarget = useRenderTarget();
  const activeTool = useSignalValue(renderTarget.commandsController.activeToolSignal);
  const dialogContentSignal =
    activeTool !== undefined ? activeTool.getAnchoredDialogContent() : UNDEFINED_SIGNAL;

  const dialogContent = useSignalValue(dialogContentSignal);
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

  const factory = useComponentFactory();

  if (dialogContent === undefined || isSomeEnabled !== true) {
    return undefined;
  }
  return (
    <ViewerAnchor position={dialogContent?.position}>
      <SuppressedMenu>
        {dialogContent.contentCommands.map((command) => factory.createElement(command, 'right'))}
      </SuppressedMenu>
    </ViewerAnchor>
  );
};

const SuppressedMenu = withSuppressRevealEvents(styled(Menu)`
  background-color: white;
`);
