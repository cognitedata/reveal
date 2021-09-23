import styled from 'styled-components';
import z from 'utils/z';

export const WorkSpaceSidebarWrapper = styled.div`
  position: fixed;
  left: 16px;
  top: 16px;
  bottom: 16px;
  padding: 16px;
  width: 320px;
  border-radius: 2px;
  background: white;
  z-index: ${z.OVERLAY};
`;

export const Results = styled.div``;
