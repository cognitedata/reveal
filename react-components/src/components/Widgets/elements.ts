import styled from 'styled-components';

export const WidgetContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px 10px 10px 10px;
`;

export const WidgetBody = styled.div`
  height: 100%;
  overflow: auto;
`;

export const StyledComponent = styled.div<{ isMinimized: boolean }>`
  position: absolute;
  left: ${({ isMinimized }) => (isMinimized ? 'auto' : 'calc(60% - 20px)')};
  right: ${({ isMinimized }) => (isMinimized ? '0px' : 'auto')};
  top: 50px;
  width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
  height: auto;
  min-width: 20%;
  min-height: 10%;
  max-width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
`;
