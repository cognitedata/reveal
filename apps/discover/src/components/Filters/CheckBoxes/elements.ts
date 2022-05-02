import styled from 'styled-components/macro';

export const Container = styled.div`
  padding: 2px;
  border-radius: 4px;
  &:hover {
    background-color: var(--cogs-greyscale-grey3);
  }
`;

export const Title = styled.div`
  margin: 5px 0;
  font-weight: bold;
`;

export const TitleWrapper = styled.div`
  display: flex;
  position: sticky;
  top: 0;
`;
