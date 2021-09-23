import styled from 'styled-components';

export const EditTextarea = styled.div`
  flex-direction: row;
  width: 100%;

  .cogs-textarea {
    width: 100%;
  }
`;
export const DisplayName = styled.div`
  white-space: nowrap;
  font-weight: 500;
`;
export const Email = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 12px;
  margin-left: 2px;
  text-overflow: ellipsis;
`;
export const Loading = styled.div`
  font-size: 12px;
  margin: 2px;
`;
export const ActionButtons = styled.div`
  text-align: right;
  margin-top: 10px;

  .cogs-btn {
    margin-left: 5px;
  }
`;
