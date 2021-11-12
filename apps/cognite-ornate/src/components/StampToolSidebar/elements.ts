import styled from 'styled-components';
import z from 'utils/z';

export const StampToolSidebarWrapper = styled.div`
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  z-index: ${z.LIST_TOOL_OVERLAY};
`;

export const StampToolItem = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  cursor: pointer;

  img {
    margin: auto;
    width: 52px;
  }
`;
