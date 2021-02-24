import styled from 'styled-components';

type Positioning =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around';
type RowProps = {
  flex?: boolean;
  wrap?: boolean;
  align?: Positioning;
  justify?: Positioning;
  direction?: 'row' | 'column';
};

export const Row = styled.div.attrs<RowProps>(
  ({ flex, wrap, align, justify, direction }) => {
    return {
      style: {
        display: flex ? 'flex' : 'block',
        flexWrap: wrap ? 'wrap' : 'no-wrap',
        alignItems: align ?? 'flex-start',
        justifyContent: justify ?? 'flex-start',
        flexDirection: direction ?? 'row',
      },
    };
  }
)<RowProps>`
  width: 100%;
  padding: 0px;
  margin: 16px 0;
`;
