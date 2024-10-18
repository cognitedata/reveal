/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import styled from 'styled-components';
import { PopupStyle } from '../../../architecture';
import { withSuppressRevealEvents } from '../../../higher-order-components/withSuppressRevealEvents';
import { type TreeViewProps } from './TreeViewProps';
import { TreeView } from './TreeView';

export const TreeContainer = (props: TreeViewProps): ReactElement => {
  const style = new PopupStyle({ top: 50, left: 100 });

  return (
    <Container
      style={{
        width: '300px',
        height: '600px',
        left: style.leftPx,
        right: style.rightPx,
        top: style.topPx,
        bottom: style.bottomPx,
        margin: style.marginPx,
        padding: style.paddingPx
      }}>
      <TreeView {...props} />
    </Container>
  );
};

const Container = withSuppressRevealEvents(styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
  border-radius: 10px;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
  overflow-x: auto;
  overflow-y: auto;
`);
