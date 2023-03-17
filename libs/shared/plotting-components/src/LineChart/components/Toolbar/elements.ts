import styled from 'styled-components/macro';

export const ToolbarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  :empty {
    display: none;
  }
`;

export const FiltersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: auto;
  gap: 8px;
`;

export const ActionsWrapper = styled(FiltersWrapper)`
  justify-content: flex-end !important;
  overflow: hidden;
`;

export const ActionWrapper = styled.div`
  display: flex;
  position: relative;
  padding-right: 10px;
  margin-right: -10px;
  margin-left: 8px;
  ::after {
    content: '';
    position: absolute;
    top: 10px;
    right: 1px;
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
