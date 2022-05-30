import styled from 'styled-components';

export const TopBarContainer = styled.menu`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 10px 16px;
  margin: 0;
`;

export const Left = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;

  > button,
  span {
    margin-right: 10px;
  }
`;

export const Right = styled.div`
  display: flex;
  justify-content: right;

  > button {
    margin-left: 10px;
  }
`;
