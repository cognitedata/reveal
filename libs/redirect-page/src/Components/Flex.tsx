import React from 'react';

import styled from 'styled-components';

type Props = {
  row?: boolean;
  column?: boolean;
  justify?: boolean;
  align?: boolean;
  grow?: boolean;
  style?: React.CSSProperties;
};

export const Flex = styled.div.attrs((props: Props) => {
  const { row, column, justify, align, style } = props;
  const newStyle = { ...style };
  if (row) {
    newStyle.flexDirection = 'row';
  }
  if (column) {
    newStyle.flexDirection = 'column';
  }
  if (justify) {
    newStyle.justifyContent = 'center';
  }
  if (align) {
    newStyle.alignItems = 'center';
  }
  return {
    style: newStyle,
  };
})<Props>`
  display: flex;

  > * {
    flex-grow: ${(props: Props) => (props.grow ? 1 : 'unset')};
  }
`;
