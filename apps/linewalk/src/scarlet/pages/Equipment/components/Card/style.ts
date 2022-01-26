import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
`;

export const CategoryWrapper = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--cogs-text-secondary);
  margin-top: 28px;
`;

export const Delimiter = styled.div`
  height: ;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);

  &:after {
    content: '';
    display: block;
    width: 12px;
    height: 40px;
    border-right: 1px solid var(--cogs-greyscale-grey4);
  }
`;
