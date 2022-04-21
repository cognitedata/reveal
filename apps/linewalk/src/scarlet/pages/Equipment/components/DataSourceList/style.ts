import styled from 'styled-components';

export const Container = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const EmptySource = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  border: 1px solid var(--cogs-greyscale-grey4) !important;
  overflow: hidden;
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
`;

export const EmptySourceHead = styled.div`
  flex-grow: 1;
`;

export const EmptySourceBody = styled.div`
  color: var(--cogs-greyscale-grey5);
  flex-shrink: 0;
`;
