import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const LoadMoreWrapper = styled.b`
  &:hover {
    cursor: pointer;
    user-select: none;
  }
`;
export const LoadMore = (props: PropsWithChildren<any>) => (
  <LoadMoreWrapper>{props.children || 'Load more...'}</LoadMoreWrapper>
);
