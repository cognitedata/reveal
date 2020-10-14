import styled from 'styled-components';

export const ArrowsContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 22px;
  height: 16px;
`;

export const Arrow = styled.div<{ isTop: boolean; arrowColor: string }>`
  position: absolute;
  top: ${(props) => (props.isTop ? '-3px' : '7px')};
  left: ${(props) => (props.isTop ? '6px' : 0)};
  color: ${(props) => props.arrowColor};
`;
