import styled from 'styled-components/macro';

export const CustomCalculationBuilderContainer = styled.div`
  color: rgba(0, 0, 0, 0.9);

  .rc-tabs-content-holder {
    margin-top: 2em;
  }

  .rc-collapse-item {
    background-color: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 8px;
    border-top: none;
  }

  .rc-collapse {
    background-color: transparent;
  }

  .rc-collapse-content-box {
    margin-bottom: 250px;
  }

  .rc-collapse-content {
    padding: 0;
    height: 100%;
  }

  .collapsable-step,
  .step-button {
    margin-left: 16px !important;
  }

  .rc-collapse-content-box {
    margin-bottom: 10px;
  }
`;

export const CollapseHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  user-select: none;

  .left-options {
    display: flex;
    align-items: center;
    span:first-child {
      margin-right: 34px;
      font-weight: 500;
    }

    .cogs-icon {
      margin-left: 11px;
    }
  }

  .right-options {
    .cogs-icon:last-child {
      margin-left: 37px;
    }
    .drag-element {
      cursor: move;
    }
  }
`;
