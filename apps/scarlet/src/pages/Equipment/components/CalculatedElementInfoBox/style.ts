import styled from 'styled-components';

export const Container = styled.div`
  background: rgba(64, 120, 240, 0.06);
  border-radius: 6px;
  padding: 16px;
`;

export const Tag = styled.div`
  display: inline-block;
  color: #3059b3;
  border: 1px solid #4a67fb;
  border-radius: 4px;
  padding: 1px 4px;
`;

export const Copy = styled.p`
  color: var(--cogs-text-secondary);
  margin: 16px 0;
`;

export const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const FieldsRow = styled.div<{ header?: boolean }>`
  display: flex;
  width: 100%;
  gap: 10px;
  color: rgba(0, 0, 0, ${({ header }) => (header ? 0.55 : 0.9)});
`;

export const FieldName = styled.div`
  flex: 1 0 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FieldLevel = styled.div`
  flex: 0 0 150px;
`;
