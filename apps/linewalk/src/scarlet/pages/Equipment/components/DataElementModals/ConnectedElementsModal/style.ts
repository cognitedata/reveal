import styled from 'styled-components';

export const Header = styled.div`
  color: var(--cogs-text-secondary);
  margin: 28px 0 20px;
`;

export const Detection = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 6px;
  padding: 10px 12px;
  display: inline-flex;
  gap: 10px;
  margin: 0 10px;
  max-width: 520px;
`;

export const DetectionSource = styled.div`
  background-color: var(--cogs-white);
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 4px;
  padding: 2px 8px;
  color: var(--cogs-greyscale-grey6);
  flex-shrink: 0;
`;

export const DetectionValue = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CurrentField = styled.div`
  color: rgba(0, 0, 0, 0.15);
  border: 1px solid currentColor;
  padding: 2px 11px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export const SelectHeader = styled.div``;

export const TableContainer = styled.div`
  th:first-child,
  td:first-child {
    display: none;
  }
`;
