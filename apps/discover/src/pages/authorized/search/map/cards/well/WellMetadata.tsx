import React, { useMemo } from 'react';

import { waterDepthAdapter } from 'dataLayers/wells/wells/adapters/waterDepthAdapter';

import MetadataTable from 'components/metadataTable';
import { FEET } from 'constants/units';
import { Well } from 'modules/wellSearch/types';

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
