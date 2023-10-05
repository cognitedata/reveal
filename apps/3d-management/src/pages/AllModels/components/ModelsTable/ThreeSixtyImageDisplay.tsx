import { Image360Display } from '@data-exploration/containers';
import { Row } from '@tanstack/react-table';

import { Image360Data } from '@data-exploration-lib/domain-layer';

import { InternalThreeDModelData } from '../../types';

export const ThreeSixtyImageDisplay = ({
  row,
}: {
  row: Row<InternalThreeDModelData>;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${row.depth * 2}rem`,
      }}
    >
      <Image360Display model={row.original as Image360Data} />
    </div>
  );
};
