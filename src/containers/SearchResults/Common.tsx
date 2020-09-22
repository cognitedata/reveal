import styled from 'styled-components';

export const List = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
export const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const ActionRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
  .spacer {
    flex: 1;
  }
`;
