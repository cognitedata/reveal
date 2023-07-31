import styled from 'styled-components';

export const Container = styled.div`
  display: flex;

  .name-wrapper {
    float: left;
    margin-right: 8px;
  }

  .pencil-button {
    opacity: 0;
  }

  input.cogs-input {
    width: 150px;
    padding-left: 8px;
    padding-right: 8px;
    margin-right: 4px;
  }

  &:hover {
    .pencil-button {
      opacity: 1;
    }
  }

  .cogs-btn {
    margin-left: 4px;
  }
`;
