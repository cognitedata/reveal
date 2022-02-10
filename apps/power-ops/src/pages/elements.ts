import styled from 'styled-components/macro';
import { sizes } from 'styles/layout';

export const BaseContainer = styled.div`
  text-align: center;
  min-height: calc(100vh - 56px);
`;

export const Container = styled(BaseContainer)`
  padding-top: 32px;
  padding-bottom: 32px;
`;

export const Code = styled.code`
  background: var(--cogs-greyscale-grey3);
`;

export const LogOutButtonContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-right: ${sizes.small};
`;
