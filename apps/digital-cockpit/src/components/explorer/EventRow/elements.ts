import styled from 'styled-components';

export const TrWrapper = styled.tr`
  padding: 8px 24px;
  border-bottom: 2px solid var(--cogs-greyscale-grey2);
  cursor: pointer;
  &:hover {
    background: var(--cogs-midblue-8) !important;
  }
  .row--types {
    height: 64px;
    margin-right: 32px;
    display: flex;
    align-items: left;
    justify-content: center;
    flex-direction: column;
    font-weight: 500;
    .subtype {
      font-weight: 400;
      color: var(--cogs-greyscale-grey7);
    }
  }

  .row--meta {
    display: flex;
    flex-direction: column;
    h4,
    div {
      margin: 0;
      font-size: 14px;
      line-height: 20px;
      color: var(--cogs-greyscale-grey9);
    }
    div {
      color: var(--cogs-greyscale-grey7);
    }
  }

  .row--dates {
    display: table-cell;
  }

  &.header {
    background: var(--cogs-greyscale-grey2);
    th {
      padding: 12px 24px;
      font-weight: 500;
    }
  }

  .small-screen-only {
    display: none;
  }
  .large-screen-only {
    display: inherit;
  }
  @media screen and (max-width: 960px) {
    .small-screen-only {
      display: inherit;
    }
    .large-screen-only {
      display: none;
    }
  }
`;
