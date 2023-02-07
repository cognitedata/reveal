import styled from 'styled-components';

export const Container = styled.div`
  height: 50vh;
  overflow: auto;
  border: 1px solid black;
`;

export const Centered = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const RightSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 5vw;
`;

export const Scrollable = styled.div`
  height: 50vh;
  overflow: auto;
  border: 1px solid black;
  display: flex;
`;
