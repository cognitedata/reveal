import styled from 'styled-components/macro';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 8px;
  gap: 8px;
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 200px;
`;

export const Title = styled.span`
  color: var(--cogs-text-icon--medium);
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  font-feature-settings: 'cv05' on;
`;

export const Subtitle = styled.span`
  color: var(--cogs-text-icon--muted);
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  font-feature-settings: 'ss04' on;
`;
