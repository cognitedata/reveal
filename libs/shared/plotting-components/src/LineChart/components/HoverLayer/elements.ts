import styled from 'styled-components/macro';

export const HoverLayerWrapper = styled.div``;

export const Line = styled.div`
  position: absolute;
  border-left: 1px solid #000000;
  transition: opacity 0.4s ease;
`;

export const LineInfo = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  white-space: nowrap;
  color: #ffffff;
  background: #262626;
  border-radius: 6px;
  padding: 8px;
  font-size: 12px;
  transform: translateX(-50%);
  margin-top: 6px;
  transition: opacity 0.4s ease;

  ::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: ${(props: { offset: number }) => `calc(50% + ${props.offset}px)`};
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #262626 transparent;
  }
`;
