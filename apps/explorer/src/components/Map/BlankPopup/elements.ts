import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const BlankPopupContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  padding-top: ${sizes.small};
`;

export const BlankPopupDisplayContainer = styled.div`
  z-index: ${layers.MAXIMUM};
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
`;
