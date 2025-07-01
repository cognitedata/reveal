import { type ReactElement } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import styled from 'styled-components';

import { ShowTreeViewCommand } from '../../architecture/base/concreteCommands/ShowTreeViewCommand';
import { useSignalValue } from '@cognite/signals/react';
import { TreeView } from './TreeView';
import { signal } from '@cognite/signals';

export const TreeViewContainer = (): ReactElement => {
  const renderTarget = useRenderTarget();
  const showTreeViewCommand =
    renderTarget.commandsController.getCommandByTypeRecursive(ShowTreeViewCommand);

  const showTreeSignal = showTreeViewCommand?.showTree;
  const showTree = useSignalValue(showTreeSignal ?? signal(false));

  if (!showTree) {
    return <></>;
  }
  const style = showTreeViewCommand?.getPanelInfoStyle();

  return (
    <Container
      style={{
        width: 300,
        left: style?.leftPx,
        right: style?.rightPx,
        top: style?.topPx,
        bottom: style?.bottomPx,
        margin: style?.marginPx,
        padding: style?.paddingPx
      }}>
      <TreeView />
    </Container>
  );
};

const Container = styled.div`
  z-index: 1000;
  position: absolute;
  display: block;
  border-radius: 6px;
  overflow-x: auto;
  overflow-y: auto;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
`;
