import styled from 'styled-components';

export const Container = styled.div`
  text-align: center;

  h3 {
    font-size: 1rem;
    color: var(--cogs-greyscale-grey7);
    margin-bottom: 2rem;
  }
`;

export const ChartContainer = styled.div`
  padding-bottom: 2rem;
  margin-bottom: 2.5rem;

  &:first-of-type {
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
  }
`;
