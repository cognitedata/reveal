import styled from 'styled-components';
import z from 'utils/z';

export const Container = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: #ffffff;
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.04);

  border-radius: 6px;
  z-index: ${z.OVERLAY};
`;
