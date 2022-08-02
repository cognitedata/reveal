import styled from 'styled-components/macro';

export const CardContainer = styled.div`
  display: flex;
`;
export const Elevation = styled.div`
  cursor: pointer;
  width: 300px;
  height: 128px;
  background: white;
  margin: 32px;
  align-items: center;
  justify-content: center;
  user-select: none;
  flex-direction: row;
`;

export const Content = styled.div`
  background: white;
  margin: 32px;
  display: flex;
  text-align: left;
  justify-content: left;
`;

export const Warning = styled.div`
  background-color: var(--cogs-danger);
  margin: 32px;
  padding: 20px;
  color: white;
`;
