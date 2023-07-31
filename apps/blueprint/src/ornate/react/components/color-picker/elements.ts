import styled from 'styled-components';

export const ColorPicker = styled.div`
  display: flex;
  width: 192px;
  flex-flow: wrap;
  .color-selector-item {
    width: 20px;
    height: 20px;
    border-radius: 20px;
    margin: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
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
