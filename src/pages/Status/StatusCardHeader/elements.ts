import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  padding: 1.5rem 2rem 1.4rem 2rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  align-items: center;
  justify-items: flex-start;

  h2 {
    margin: 0;
    font-weight: 700;
  }
`;

export const ChildrenContainer = styled.div`
  margin-left: auto;
`;
