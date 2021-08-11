import styled from 'styled-components/macro';

export const Elevation = styled.div`
  width: 300px;
  height: 128px;
  background: white;
  margin: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 300px;
  padding: 20px;
  color: white;
`;
