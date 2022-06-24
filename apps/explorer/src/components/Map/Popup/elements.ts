import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const Container = styled.div`
  z-index: ${layers.MAXIMUM};
  position: absolute;
  width: 100%;
  bottom: ${sizes.medium};
  left: 0;
  display: flex;
  justify-content: center;
`;

export const Content = styled.div`
  width: 85%;
  min-height: 200px;
  padding: ${sizes.medium} ${sizes.medium};
  background: #ffffff;
  border-radius: ${sizes.medium};
`;

export const TextWrapper = styled.div`
  margin-left: ${sizes.small};
  display: inline-block;
`;
