import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

export const Header = styled.div`
  flex-shrink: 0;
`;

export const StateGroupContainer = styled.div`
  margin: 20px 0 0;
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
    height: 16px;
  }
`;

export const ScrollContainer = styled.div`
  position: absolute;
  top: 0;
  right: -18px;
  bottom: -18px;
  left: -18px;
  overflow-x: hidden;
  padding: 20px 18px 18px;
`;

export const ListContainer = styled.div`
  margin: -8px 0;
`;

export const SelectAllContainer = styled.div`
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;
  padding: 10px;
  margin: 20px 0 0;
  display: flex;
  align-items: center;

  background-color: var(--cogs-greyscale-grey2);
  border-color: var(--cogs-greyscale-grey2);
`;
