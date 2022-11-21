import { Select } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

export const SourceSelect = styled(Select)`
  width: 100%;
  margin-bottom: 10px;
`;

export const GhostMetadataFilter = styled.div`
  > div {
    background-color: transparent;
  }
`;

const activeBoxStyles = css`
  border-color: var(--cogs-border--interactive--hover);
  background-color: var(--cogs-surface--interactive--toggled-hover);
`;

const activeBoxWarningStyles = css<{ $active: boolean }>`
  border-color: rgba(255, 187, 0, 0.5);
  background-color: rgba(255, 187, 0, 0.2);
`;

export const EventDetails = styled.aside<{ $active: boolean }>`
  margin-bottom: 1rem;
  border: 1px solid #d9d9d9;
  background-color: #fafafa;
  border-radius: 0.5rem;
  padding: 1rem 1rem 0.5rem;

  ${(props) => (props.$active ? activeBoxStyles : '')};

  .cogs-body-2 {
    text-overflow: ellipsis;
    width: 100%;
    overflow: hidden;
  }

  .hint {
    border-radius: 0.25rem;
    border: 1px solid;
    padding: 0.5rem;
    font-size: 0.75rem;
    border-color: rgba(255, 187, 0, 0.2);
    background-color: rgba(255, 187, 0, 0.1);
    ${(props) => (props.$active ? activeBoxWarningStyles : '')};
  }

  .ant-row {
    margin-bottom: 10px;
  }
`;
