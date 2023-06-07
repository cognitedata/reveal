import styled from 'styled-components/macro';

export const OptionContentWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const OptionCount = styled.div`
  display: flex;
  align-items: center;
  background: var(--cogs-surface--status-neutral--muted--default);
  color: var(--cogs-text-icon--status-neutral);
  padding: 2px 6px;
  margin-left: auto;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
`;

export const OptionCountDisabled = styled(OptionCount)`
  background: var(--cogs-surface--status-undefined--muted--default);
  color: var(--cogs-text-icon--status-undefined);
`;
