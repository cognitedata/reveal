import styled from 'styled-components';

type TFlex = {
  row?: boolean;
  column?: boolean;
  justify?: boolean;
  align?: boolean;
  grow?: boolean;
  style?: any;
};

export const Flex = styled.div.attrs((props: TFlex) => {
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
})<TFlex>`
  display: flex;

  > * {
    flex-grow: ${(props) => (props.grow ? 1 : 'unset')};
  }
`;
