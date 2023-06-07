import styled from 'styled-components/macro';

export const NodeWrapper = styled.div`
  &&& {
    background: white;
    border: 1px solid var(--cogs-border-accent);
    border-radius: 10px;
    min-height: 30px;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
    box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
      0px 3px 8px rgba(0, 0, 0, 0.06);

    &.selected {
      border: 1px solid var(--cogs-border-default);
      box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.08),
        0px 2px 10px rgba(0, 0, 0, 0.06);
    }
  }
`;

export const ColorBlock = styled.div`
  &&& {
    background-color: ${(props) => props.color};
    width: 14px;
    min-height: 30px;
    border-radius: 4px;
    margin-right: 8px;
  }
`;

export const InputWrapper = styled.div`
  &&& {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 5px 0;
  }
`;

export const NoDragWrapper = styled.div.attrs(() => ({
  className: 'nodrag',
}))``;
