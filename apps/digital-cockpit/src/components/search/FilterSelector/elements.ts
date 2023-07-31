import styled from 'styled-components';

export const FilterSelectorWrapper = styled.div`
  padding: 16px 24px;
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);

  .filter-selector {
    display: flex;
    margin-bottom: 8px;
    .selector-divider {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    input {
      width: 120px;
    }
  }
  .add-filter-btn {
    margin-top: 16px;
  }
`;
