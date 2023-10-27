import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

export const Spinner = () => (
  <Container>
    <Icon type="Loader" aria-label="Spinning icon" />
  </Container>
);

const Container = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  justify-content: center;
`;
