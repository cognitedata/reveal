import styled from 'styled-components';

export const CardGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  grid-gap: 16px;
  .card-header {
    height: 100%;
  }
`;

export const HomeWrapper = styled.div`
  background: white;
  padding: 32px 64px;
  min-height: 100%;

  > header {
    margin-bottom: 16px;
  }
  > section {
    padding-bottom: 64px;
    .section-content {
      margin-top: 24px;
    }
  }

  .card {
    margin-right: 16px;
    cursor: pointer;
  }

  .glider {
    overflow-y: visible !important;
  }

  .browse-solutions {
    color: var(--cogs-link-primary-default);
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
    &:hover {
      color: var(--cogs-link-primary-hover);
    }
  }
`;
