import styled from 'styled-components';

const SelectorItem = styled.div<{ $isSelected?: boolean }>`
  flex: 1;
  width: auto;
  cursor: pointer;
  border: 1px solid
    ${(props) =>
      props.$isSelected
        ? 'var(--cogs-border--interactive--toggled-default)'
        : 'rgba(83, 88, 127, 0.16)'};
  background: ${(props) =>
    props.$isSelected
      ? 'var(--cogs-surface--interactive--toggled-default)'
      : 'white'};
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  .cogs-icon {
    padding: 22px;
    background-color: var(--cogs-surface--medium);
    display: block;
    width: auto !important;
    border-radius: 8px;

    svg {
      width: 21px;
      height: 21px;
    }
  }
`;

const Wrapper = styled.div`
  display: grid;
  column-count: 3;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;
export const Selector =
  // eslint-disable-next-line prefer-object-spread
  Object.assign({}, Wrapper, {
    Item: SelectorItem,
  });
