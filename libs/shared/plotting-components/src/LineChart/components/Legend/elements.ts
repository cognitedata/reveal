import styled from 'styled-components/macro';

export const LegendWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 8px;
  gap: 16px;
  flex-wrap: wrap;
`;

export const LegendItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  border-right: 2px solid var(--cogs-border--muted);
  padding-right: 16px;
  :last-child {
    border-right: none;
    padding-right: 0;
  }
`;

export const LegendItemIcon = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
`;

export const LegendItemLabel = styled.div`
  font-weight: 500;
  font-size: 12px;
  margin-top: 4px;
`;
