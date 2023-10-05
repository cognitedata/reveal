import { Row } from '@tanstack/react-table';

import { InternalThreeDModelData } from '../../types';

export const ThreeSixtyContextualizationStatus = ({
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
      {/*TODO: add logic for contextualization status, tracked by: https://cognitedata.atlassian.net/browse/BND3D-2244*/}
    </div>
  );
};
