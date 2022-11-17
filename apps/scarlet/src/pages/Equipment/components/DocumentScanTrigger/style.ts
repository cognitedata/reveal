import styled from 'styled-components';
import z from 'utils/z';

export const Container = styled.div`
  position: absolute;
  right: 18px;
  bottom: 16px;
  background: #ffffff;

  z-index: ${z.OVERLAY};
`;
