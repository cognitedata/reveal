import styled from 'styled-components';

const StyledLayout = styled.div`
  @media (min-width: 600px) {
    width: calc(100% - 64px);
    margin: 0 32px;
  }

  @media (min-width: 1240px) {
    width: calc(100% - 312px);
    margin: 0 156px;
  }

  @media (min-width: 1440px) {
    width: 1128px;
    margin: 0 auto;
  }
`;

export default StyledLayout;
