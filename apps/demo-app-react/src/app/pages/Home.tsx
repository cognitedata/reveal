import { Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const Home = () => {
  return (
    <StyledWrapper>
      <Title level={3}>This is a playground project for Platypus.</Title>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;
