import styled from 'styled-components';

export const StyledClusterSelector = styled.div`
  margin-bottom: 34px;

  .cluster-selector_inputs-wrapper {
    display: flex;
    .cogs-input-container:first-child {
      margin-right: 8px;
    }
  }

  .cluster-selector_buttons-wrapper {
    display: flex;
    .cogs-btn-unstyled {
      width: 35%;
      margin-right: 8px;
      font-size: 14px;
      font-weight: bold;
    }
    .cogs-btn {
      width: 65%;
    }
  }
`;
