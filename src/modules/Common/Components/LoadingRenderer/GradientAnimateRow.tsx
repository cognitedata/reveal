import React from 'react';
import styled from 'styled-components';
import Text from 'src/modules/Common/Components/Skeleton/layouts/Text';

export const GradientAnimateRow = ({
  width,
  children,
}: {
  width: number;
  children?: React.ReactNode;
}) => (
  <>
    <Cell width={width}>{children || <Text />}</Cell>
  </>
);

const Cell = styled.div<{ width: number }>`
  display: flex;
  flex: ${(props) => (props.width === 0 ? '1 1 auto' : 'none')};
  align-items: center;
  width: ${(props) => `${props.width}px`};
  padding: 0 7.5px;
  height: 47px;
  font-size: 20px;
`;
