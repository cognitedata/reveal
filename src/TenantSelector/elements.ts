import styled from 'styled-components';
import { CardContainer } from 'styles/elements';

export const StyledTenantSelector = styled(CardContainer)`
  width: 480px;
  max-width: 100%;

  .cogs-input-container {
    .input-wrapper,
    .cogs-input {
      width: 100%;
    }
  }

  .cogs-title-5 {
    font-weight: 700;
    line-height: 24px;
  }

  .name {
    font-size: 36px;
    margin: 4px 0px 20px 0px;
  }

  .tenant-selector__company-item {
    margin: 0px 0px 16px;
  }

  .has-error .cogs-input {
    border: 1px solid var(--cogs-danger);
  }
`;
