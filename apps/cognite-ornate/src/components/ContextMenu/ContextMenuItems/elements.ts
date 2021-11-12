import styled from 'styled-components';

export const ShapeStyleControlWrapper = styled.div`
  .ornate-stroke-style-menu {
    position: fixed;
    margin-top: -202px;
    flex-direction: column;
    justify-content: space-evenly;
  }
`;

export const FontSizeControlWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .ornate-font-size-control {
    width: 50px;
  }

  input[type='number'] {
    appearance: auto;
  }

  input[type='number']::-webkit-inner-spin-button {
    cursor: pointer;
    appearance: inner-spin-button;
    opacity: 1;
  }
`;
