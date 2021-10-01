import styled from 'styled-components';

export const ListItem = styled.a`
  color: var(--cogs-b2-color);
  font-size: var(--cogs-b2-font-size);
  letter-spacing: var(--cogs-b2-letter-spacing);
  line-height: var(--cogs-b2-line-height);
  display: block;
  text-transform: uppercase;
  padding-top: 10px;
  padding-bottom: 10px;
  cursor: pointer;
  position: relative;
  border-bottom: 1px solid #d9d9d9;

  &.action-buttons {
    padding-right: 20px;
  }

  .action-button {
    position: absolute;
    top: 13px;
    right: 0;
    display: none;
  }

  &:hover .action-button {
    display: block;
  }
`;
