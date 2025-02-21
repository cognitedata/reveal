/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import styled from 'styled-components';

import { ShowTreeViewCommand } from '../../architecture/base/concreteCommands/ShowTreeViewCommand';
import { useSignalValue } from '@cognite/signals/react';
import { TreeView } from './TreeView';

export const TreeViewContainer = (): ReactElement => {
  const renderTarget = useRenderTarget();
  const showTreeViewCommand =
    renderTarget.commandsController.getCommandByTypeRecursive(ShowTreeViewCommand);

  if (showTreeViewCommand === undefined) {
    return <></>;
  }
  const showTree = useSignalValue(showTreeViewCommand.showTree);
  if (!showTree) {
    return <></>;
  }
  const style = showTreeViewCommand.getPanelInfoStyle();

  return (
    <Container
      style={{
        width: 300,
        left: style.leftPx,
        right: style.rightPx,
        top: style.topPx,
        bottom: style.bottomPx,
        margin: style.marginPx,
        padding: style.paddingPx
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
