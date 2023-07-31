import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--cogs-greyscale-grey5);
  background: var(--cogs-greyscale-grey3);
  border-radius: var(--cogs-border-radius--default);
  padding: 6px 12px;
`;

export const Content = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

export const Title = styled.label`
  display: block;
  color: var(--cogs-greyscale-grey8);
  margin-bottom: 5px;
  flex-grow: 1;
`;

export const Origin = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const Label = styled.div`
  flex-grow: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const Tag = styled.div`
  border: 1px solid var(--cogs-border-default);
  padding: 1px 4px;
  text-transform: uppercase;
  border-radius: 4px;
`;
