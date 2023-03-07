import styled from 'styled-components/macro';

export const ToolbarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FiltersWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
`;

export const ActionsWrapper = styled(FiltersWrapper)`
  justify-content: flex-end !important;
`;

export const ActionWrapper = styled.div`
  display: flex;
  ::after {
    content: '';
    margin-left: 8px;
    margin-top: 10px;
    height: 16px;
    border-right: 2px solid #d9d9d9;
  }
  :last-child::after {
    border: none;
    margin-left: 0;
  }
  :empty {
    display: none;
  }
`;
