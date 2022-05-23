import styled from 'styled-components';
import { Color } from 'scarlet/config';

export const Header = styled.div`
  color: var(--cogs-text-secondary);
  margin: 28px 0 20px;
`;

export const Detection = styled.div`
  border: 1px solid rgba(83, 88, 127, 0.16);
  color: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  padding: 10px 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 10px;
  max-width: 520px;
`;

export const DetectionSource = styled.div<{
  isPrimary?: boolean;
}>`
  display: flex;
  align-items: center;
  color: var(--cogs-white);
  border-radius: 4px;
  padding: 1px 4px;
  align-items: center;
  gap: 4px;
  background-color: ${({ isPrimary }) => {
    if (isPrimary) return Color.APPROVED;

    return Color.PENDING;
  }};
  flex-shrink: 0;
`;

export const DetectionValue = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
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
