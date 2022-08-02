import { sizes } from 'styles/layout';
import styled from 'styled-components';
import layers from 'utils/zindex';

const baseHeaderStyles = `
  z-index: ${layers.OVERLAY};
  gap: ${sizes.small};
  justify-content: space-around;
  align-items: center;
  display: flex;
  margin-bottom: ${sizes.small};
  width: 100%;
`;

export const StyledRegularHeader = styled.div`
  ${baseHeaderStyles}
`;

export const StyledAbsoluteHeader = styled.div`
  ${baseHeaderStyles}
  position: absolute;
  top: 0;
  left: 0;
  padding: ${sizes.normal};
`;

export const HeaderLeft = styled.div`
  flex: 1;
`;
