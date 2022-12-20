import styled from 'styled-components';

export const Container = styled.div`
  padding: 16px;
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  div {
    margin-bottom: 4px;
  }

  .cogs-graphic,
  .cogs-label {
    margin: 16px 0;
  }

  &.processes {
    margin: 15vh 0;
  }
  &.workflows {
    margin: 25vh 0;
  }
`;

export const SearchAndFilter = styled.div`
  display: flex;
  padding-bottom: 24px;

  .cogs-select {
    min-width: 300px;
    padding-right: 8px;

    .cogs-select__menu {
      min-width: fit-content;
    }
  }
`;

export const CellWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: fit-content;
  margin-left: auto;

  .cogs-btn {
    margin-right: 4px;
  }
`;
