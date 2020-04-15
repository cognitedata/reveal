import styled from 'styled-components';
import { CardContainer } from '../elements';

export const StyledTenantSelector = styled(CardContainer)`
  input {
    height: 40px;
  }

  .name {
    font-size: 36px;
    margin: 4px 0px 20px 0px;
  }

  .tenant-selector__company-item {
    margin: 0px 0px 16px;
  }
`;

export const CompanyIdLabel = styled.span`
  vertical-align: middle;
`;
