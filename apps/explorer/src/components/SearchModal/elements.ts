import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const SearchModalWrapper = styled.div`
  position: absolute;
  background: white;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  padding: ${sizes.medium};
  z-index: ${layers.MAXIMUM}; ;
`;
