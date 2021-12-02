import styled from 'styled-components';

export const ToastInnerContainer = styled.div`
  width: 100%;
`;

export const GoBackContainer = styled.div`
  margin-right: 1em;
`;

export const GenericInformationTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  caption {
    caption-side: top;
    color: var(--cogs-text-color);
    font-weight: bold;
  }

  td {
    border: 1px solid var(--cogs-border-default);
    padding: 6px 8px;
  }

  .label {
    white-space: nowrap;
    width: 0;
    opacity: 0.6;
  }

  .value div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .number,
  .unit {
    white-space: nowrap;
  }

  .number {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
