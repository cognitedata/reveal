import styled from 'styled-components/macro';

export const BaseContainer = styled.div`
  text-align: center;
  height: calc(100vh - 56px);
`;

export const Container = styled(BaseContainer)`
  padding-top: 32px;
`;

export const Code = styled.code`
  background: var(--cogs-greyscale-grey3);
`;
