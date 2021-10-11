import React, { useMemo } from 'react';

import { changeUnits } from '_helpers/units/utils';
import MetadataTable from 'components/metadataTable';
import { FEET } from 'constants/units';
import { Well } from 'modules/wellSearch/types';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';

interface Props {
  well: Well | null;
}

const unitChangeAccessors = [
  {
    accessor: 'waterDepth.value',
    fromAccessor: 'waterDepth.unit',
    to: FEET,
  },
];

export const WellMetadata: React.FC<Props> = ({ well }) => {
  const adaptedWell = useMemo(
    () =>
      convertToFixedDecimal(changeUnits(well, unitChangeAccessors), [
        'waterDepth.value',
      ]),
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
