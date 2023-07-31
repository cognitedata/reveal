import styled from 'styled-components';

export const ColorPickerWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: wrap;
  .color-selector-item {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    margin: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    .selected {
      color: var(--cogs-white);
      stroke: var(--cogs-white);
      stroke-width: 1px;
    }
    &:hover {
      transform: scale(1.2);
    }
  }
`;
