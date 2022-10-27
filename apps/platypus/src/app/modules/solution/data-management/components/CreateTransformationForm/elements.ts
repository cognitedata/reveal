import styled from 'styled-components';

export const Row = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  &:last-child {
    margin: 0;
  }
`;

export const Column = styled.div`
  flex-grow: 1;
  width: 50%;
  align-self: flex-end;
`;

export const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
`;
