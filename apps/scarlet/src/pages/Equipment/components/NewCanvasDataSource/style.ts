import styled from 'styled-components';

export const Container = styled.div`
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 8px;
`;

export const Header = styled.div`
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
`;

export const Body = styled.div`
  padding: 16px 12px;
`;

export const ContentContainer = styled.div`
  background-color: var(--cogs-greyscale-grey1);
  padding: 24px 20px;
`;

export const Content = styled.div`
  width: 160px;
  margin: 0 auto;
  text-align: center;

  > .cogs-micro {
    color: var(--cogs-text-color-secondary);
  }
`;
