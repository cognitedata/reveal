import { waterDepthAdapter } from 'domain/wells/well/internal/adapters/waterDepthAdapter';
import { Well } from 'domain/wells/well/internal/types';

import React, { useMemo } from 'react';

import MetadataTable from 'components/MetadataTable';
import { FEET } from 'constants/units';

interface Props {
  well: Well | null;
}

export const WellMetadata: React.FC<Props> = ({ well }) => {
  const adaptedWell = useMemo(
    () => (well ? waterDepthAdapter(well) : well),
    [well]
  );

  const metadata = useMemo(
    () => [
      {
        label: `Water Depth (${FEET})`,
        value: adaptedWell?.waterDepth?.value,
      },
      { label: 'Source', value: adaptedWell?.sources },
      { label: 'Operator', value: adaptedWell?.operator },
      {
        label: 'Spud Date',
        value: adaptedWell?.spudDate,
        type: 'date' as const,
      },
    ],
    [adaptedWell]
  );

  return <MetadataTable columns={2} metadata={metadata} />;
};
