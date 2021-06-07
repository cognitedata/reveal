import styled from 'styled-components';

export const Container = styled.div`
  width: 96%;
  max-width: 1024px;
  margin: 0 auto;

  .cogs-body-1 {
    margin: 1em 0 1.6em 0;
  }

  .cogs-row {
    margin-bottom: 32px;
    .cogs-col {
      background-color: var(--cogs-white);
      border-radius: 16px;
      padding: 24px 32px;
      box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1);

      strong {
        font-weight: 600;
      }
    }
  }
`;

export const TextCard = styled.div``;
