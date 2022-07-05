import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

export const ScrollContainer = styled.div`
  position: absolute;
  top: 0;
  right: -18px;
  bottom: -18px;
  left: -18px;
  overflow-x: hidden;
  padding: 0 18px 18px;
  display: flex;
  flex-direction: column;
`;

export const ContentWrapper = styled.div`
  flex-grow: 1;
  position: relative;

  &:after {
    content: '';
    display: block;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 100%
    );

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 12px;
  }
`;
