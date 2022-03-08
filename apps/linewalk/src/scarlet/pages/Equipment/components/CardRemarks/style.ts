import styled, { css } from 'styled-components';

export const Container = styled.div``;

export const Content = styled.div<{ empty: boolean }>`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  ${({ empty }) =>
    empty &&
    css`
      align-items: center;
      justify-content: center;
    `}
`;

export const EmptyContainer = styled.div`
  padding: 20px 0;

  > .cogs-micro {
    color: var(--cogs-text-color-secondary);
  }
`;

export const TextareaContainer = styled.div`
  position: relative;

  textarea {
    min-height: 0;
    padding: 8px 40px 8px 12px;
  }

  button {
    position: absolute;
    top: 50%;
    right: 2px;
    transform: translateY(-50%);
    height: calc(100% - 4px);
  }
`;

export const RemarksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
`;

export const RemarkMessage = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  color: var(--cogs-text-color-secondary);
  padding: 16px;
  white-space: pre-wrap;
`;

export const RemarkTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const RemarkFooter = styled.div`
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
`;

export const RemarkUser = styled.span`
  color: var(--cogs-midblue-3);
`;
