import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Colors } from '@cognite/cogs.js';

type Props = {
  children: string | React.ReactNode;
  loading: boolean;
};
export const LoadingSkeleton = (props: Props): JSX.Element => {
  const { loading, children } = props;

  return loading ? <Skeleton /> : <>{children}</>;
};

const load = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
`;

const Skeleton = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 1em;
  overflow: hidden;
  background-color: ${Colors['greyscale-grey3'].hex()};
  border-radius: 4px;

  &:after {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(
      90deg,
      #e8e8e8,
      #f5f5f5,
      #fafafa,
      #f5f5f5,
      #e8e8e8
    );
    animation: ${load} 2s infinite;
    content: '';
  }
`;
