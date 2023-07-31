import styled from 'styled-components';

export const RowWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid var(--cogs-greyscale-grey2);
  cursor: pointer;
  &:hover {
    background: var(--cogs-midblue-8) !important;
  }
  .row--image {
    min-width: 256px;
    max-width: 256px;
    height: 64px;
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      object-fit: cover;
      width: 100%;
    }
  }

  .row--meta {
    display: flex;
    flex-direction: column;
    h4,
    div {
      margin: 0;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: var(--cogs-greyscale-grey9);
    }
    div {
      color: var(--cogs-greyscale-grey7);
    }
  }
`;
