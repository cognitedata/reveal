import { type ReactNode, type ReactElement } from 'react';
import { type Vector2 } from 'three';
import styled from 'styled-components';
import { useRenderTarget } from './RevealCanvas';
import { withSuppressRevealEvents } from '../higher-order-components/withSuppressRevealEvents';
import { type ContextMenuData } from '../architecture/base/renderTarget/ContextMenuController';
import { useSignalValue } from '@cognite/signals/react';

export const ContextMenu = ({
  Content
}: {
  Content: ({ contextMenuData }: { contextMenuData: ContextMenuData }) => ReactNode;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const contextMenuData = useSignalValue(renderTarget.contextMenuController.data);
  if (contextMenuData === undefined) {
    return <></>;
  }
  return (
    <StyledDiv
      $position={contextMenuData.position}
      onClick={() => {
        renderTarget.contextMenuController.data(undefined);
      }}>
      <Content contextMenuData={contextMenuData} />
    </StyledDiv>
  );
};

const StyledDiv = withSuppressRevealEvents(styled.div<{ $position: Vector2 }>`
  position: absolute;
  left: ${(props) => props.$position.x}px;
  top: ${(props) => props.$position.y}px;
`);
