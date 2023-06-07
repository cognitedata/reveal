import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  align-items: center;

  .cogs-title-5 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  *:not(:first-child) {
    margin-left: 4px;
  }
`;
