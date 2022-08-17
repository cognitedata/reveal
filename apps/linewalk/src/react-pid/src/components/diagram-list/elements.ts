import styled from 'styled-components';

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 50px 100px;
  z-index: ${3};
`;

export const ListContainer = styled.div`
  position: relative;
  height: fit-content;
  max-height: 100%;
  background-color: #fff;
  box-shadow: var(--cogs-z-20);
  border-radius: 8px;
  padding: 16px;
  overflow: auto;

  th:last-of-type {
    display: flex;
    justify-content: right;
    .cogs-table-sort {
      display: none;
      pointer-events: none;
    }
  }
  td:last-of-type {
    text-align: right;
  }
  .cogs-table-pagination {
    margin: unset;
    padding-top: 16px;
  }
`;

export const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
`;

export const ListFooter = styled.div`
  display: flex;
  justify-content: right;
  align-items: center;
`;
