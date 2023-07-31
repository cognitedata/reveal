import styled from 'styled-components/macro';

export const MiddleEllipsisContent = styled.div`
  display: inline-flex;
  flex-wrap: nowrap;
  max-width: 100%;
`;

export const RelativeText = styled.div`
  flex: 0 1 auto;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre;
`;

export const FixedText = styled.div`
  flex: 1 0 auto;
  white-space: pre-wrap;
  text-transform: initial;
`;

export const MiddleEllipsisContainer = styled.div`
  width: inherit;

  & > span {
    width: inherit;
  }
`;
