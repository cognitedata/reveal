import styled from 'styled-components';
import z from 'utils/z';

export const WorkSpaceToolsWrapper = styled.div`
  position: fixed;
  right: 16px;
  bottom: 16px;
  border-radius: 4px;
  z-index: ${z.OVERLAY};
`;
