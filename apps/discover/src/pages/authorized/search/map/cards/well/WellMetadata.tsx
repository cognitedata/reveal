import { WellInternal } from 'domain/wells/well/internal/types';

import React, { useMemo } from 'react';

import MetadataTable from 'components/MetadataTable';
import { FEET } from 'constants/units';

interface Props {
  well: WellInternal | null;
}

export const WellMetadata: React.FC<Props> = ({ well }) => {
  const metadata = useMemo(
    () => [
      {
        label: `Water Depth (${FEET})`,
        value: well?.waterDepth?.value,
      },
      { label: 'Source', value: well?.sourceList },
      { label: 'Operator', value: well?.operator },
      {
        label: 'Spud Date',
        value: well?.spudDate,
        type: 'date' as const,
      },
    ],
    [well]
  );

  return <MetadataTable columns={2} metadata={metadata} />;
};
