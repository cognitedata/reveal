import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  & h2 {
    font-size: 16px;
  }
`;

export const CloseIcon = styled(Icon)`
  cursor: pointer;
`;

export const Content = styled.div`
  height: calc(100% - 64px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TextArea = styled.textarea``;

export const Section = styled.section`
  margin-bottom: 24px;
  & details {
    & summary {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      color: var(--cogs-midblue);
    }
    & > div {
      margin: 16px 0 0 16px;
      & h3 {
        padding-left: 16px;
        margin-bottom: 4px;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
      }
      & Input {
        width: 100%;
        margin-bottom: 16px;
        font-size: 14px;
        &.cogs-input.cogs-input-no-border:hover {
          background: var(--cogs-greyscale-grey2);
          box-shadow: none;
          border: none;
        }
      }
      & TextArea {
        width: 100%;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        padding: 8px 16px;
        background-color: var(--cogs-greyscale-grey2);
        border: none;
        border-radius: 8px;
        box-sizing: border-box;
        resize: none;
        outline: none;
      }
    }
    & hr {
      border: none;
      border-bottom: 1px solid var(--cogs-greyscale-grey4);
      margin: 16px 0 16px 16px;
    }
  }
`;

export const StepItem = styled.div`
  display: flex;
  align-items: center;
`;

export const StepIconCircle = styled.div<{ bgColor: string; txtColor: string }>`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.txtColor};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.45rem;
  flex: none;

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const StepText = styled.span`
  color: var(--cogs-greyscale-grey6);
`;

export const StepTime = styled.span`
  color: var(--cogs-black);
`;
