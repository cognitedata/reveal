import styled, { css } from 'styled-components';

import { Select } from '@cognite/cogs.js';

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
  margin-bottom: 0.25rem;
  border: 1px solid #d9d9d9;
  background-color: #fafafa;
  border-radius: 0.5rem;
  padding: 0.5rem;

  ${(props) => (props.$active ? activeBoxStyles : '')};

  .cogs-micro {
    text-overflow: ellipsis;
    width: calc(100% - 8px);
    overflow: hidden;

    [class^='cogs-body-'],
    [class^='cogs-body-'] a,
    [class^='cogs-body-'] span,
    a {
      font-size: var(--cogs-micro-font-size);
      line-height: var(--cogs-micro-line-height);
    }
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

  .ant-row:not(:last-child) {
    margin-bottom: 10px;
  }
`;

export const EventDetailBox = styled.section`
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;

  > h5 {
    border-bottom: 1px solid #d9d9d9;
    padding: 16px 12px;
  }

  > article {
    padding: 16px 12px;
  }
`;

export const MetadataWrapItem = styled.p`
  word-break: break-word;
`;
