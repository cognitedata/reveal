import styled from 'styled-components/macro';

export const IndicatorContainerImage = styled.div`
  display: flex;
`;

export const SidebarContainer = styled.div`
  margin: 16px;

  .header {
    display: flex;
    align-items: center;
    .name {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
      .version {
        margin: 0 0 0 8px;
      }
    }
  }

  dl {
    margin: 16px 0;
    dt {
      font-weight: bold;
      &::after {
        content: ':';
      }
    }
  }
`;

export const BoundaryConditionContainer = styled.div`
  .no-content {
    color: var(--cogs-text-color-secondary);
    text-align: center;
    font-style: italic;
  }

  table {
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
  }

  .charts-link {
    margin: 16px 0;
    & > * {
      width: 100%;
    }
  }
`;
