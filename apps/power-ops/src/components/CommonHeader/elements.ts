import styled from 'styled-components/macro';

export const Header = styled.span`
  display: flex;
  position: static;
  padding: 12px 16px;
  text-align: left;
  align-items: center;
  background: var(--cogs-bg-default);
  border-bottom: 1px solid var(--cogs-bg-control--disabled);
  top: 56px;

  .cogs-label {
    margin: 4px 0 0 0;
  }

  .cogs-select {
    margin-right: 8px;

    .cogs-select__placeholder,
    .cogs-select__single-value {
      display: flex;
      align-items: center;
      height: 100%;
      min-width: fit-content;
      position: relative;
    }
  }

  .right-side {
    display: flex;
    align-items: center;
    margin-left: auto;
  }
`;
