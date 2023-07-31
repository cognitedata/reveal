import styled from 'styled-components';

export const Container = styled.div`
  background: var(--cogs-greyscale-grey9);
  padding: 8px 8px 8px 16px;
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Label = styled.div`
  color: var(--cogs-white);
  font-weight: 500;
  flex-shrink: 0;
  flex-grow: 1;
`;

export const Actions = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
`;
