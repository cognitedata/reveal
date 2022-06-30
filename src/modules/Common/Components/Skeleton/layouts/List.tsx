import React from 'react';
import times from 'lodash/times';
import styled from 'styled-components/macro';
import Text from 'src/modules/Common/Components/Skeleton/layouts/Text';
import { sizes } from 'src/modules/Common/Components/Skeleton/layout';

interface Props {
  lines?: number;
  borders?: boolean;
}

const ListItem = styled.div`
  padding-left: ${sizes.normal};
  padding-right: ${sizes.normal};

  // Without border 64px high. With border 63px high + 1px border
  height: ${(props: Props) => (props.borders ? 63 : 64)}px;
  border-bottom: ${(props: Props) =>
    props.borders ? '1px solid var(--cogs-greyscale-grey3)' : 'none'};

  display: flex;
  align-items: center;

  &:last-of-type {
    border-bottom: none;
  }
`;

/**
 * Creates a skeleton that looks like a list
 *
 * @param {Number} lines - Amount of lines to be rendered
 * @param {Boolean} borders - Render borders between lines
 * @example <Skeleton.List lines={3} borders />
 */
const List: React.FC<Props> = ({ lines = 1, borders }: Props) => {
  return (
    <div role="table">
      {times(lines).map((count) => (
        <ListItem borders={borders} key={`skeleton-${count}`}>
          <Text currentLine={count} isOnlyLine />
        </ListItem>
      ))}
    </div>
  );
};

export default List;
