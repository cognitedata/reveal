import { WellInternal } from 'domain/wells/well/internal/types';

import React, { useMemo } from 'react';

import omit from 'lodash/omit';

import MetadataTable from '../../../../../../components/MetadataTable';
import { FormatItemProps } from '../../../../../../components/MetadataTable/formatItem';

interface Props {
  well: WellInternal;
}
export const WellAdditionalMetadata: React.FC<Props> = ({ well }) => {
  const wellData = omit(well, [
    'sourceList',
    'region',
    'spudDate',
    'waterDepth',
    'wellbores',
    'name',
  ]);

  const metadata = useMemo(() => {
    return Object.keys(wellData).reduce((result, key) => {
      if (wellData[key as keyof typeof wellData]) {
        return [
          ...result,
          {
            label: key as string,
            value:
              typeof wellData[key as keyof typeof wellData] === 'object'
                ? JSON.stringify(
                    wellData[key as keyof typeof wellData],
                    null,
                    2
                  )
                : String(wellData[key as keyof typeof wellData]),
            type: 'text' as FormatItemProps['type'],
          },
        ];
      }

      return result;
    }, [] as { label: string; value: string; type: FormatItemProps['type'] }[]);
  }, [wellData.id]);

  return (
    <>
      <MetadataTable metadata={metadata} columns={1} />
    </>
  );
};
