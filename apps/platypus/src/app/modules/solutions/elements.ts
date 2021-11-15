import styled from 'styled-components/macro';
import { StyledPageWrapper } from '../styles/SharedStyles';

export const StyledSolutionListWrapper = styled(StyledPageWrapper)`
  .header {
    width: 1020px;
    margin: 50px auto 0 auto;
  }

  .solutions {
    display: flex;
    margin-top: 3rem;
  }

  .emptyList {
    margin: 100px auto;
    text-align: center;
  }
`;
