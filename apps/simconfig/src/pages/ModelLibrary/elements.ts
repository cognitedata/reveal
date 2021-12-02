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

  .charts-link {
    margin: 16px 0;
    & > * {
      width: 100%;
    }
  }
`;
