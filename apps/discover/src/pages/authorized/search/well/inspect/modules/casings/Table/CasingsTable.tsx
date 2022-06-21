import { filterCasingsByWellOrWellboreName } from 'domain/wells/casings/internal/selectors/filterCasingsByWellOrWellboreName';

import React, { useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';
import { NO_RESULTS_TEXT } from 'components/EmptyState/constants';

import { CasingSchematicView } from '../types';

import { CasingPreview } from './CasingPreview';
import { CasingsWellsTable } from './CasingsWellsTable';

interface CasingsTableProps {
  data: CasingSchematicView[];
  searchPhrase?: string;
}

export const CasingsTable: React.FC<CasingsTableProps> = ({
  data,
  searchPhrase = '',
}) => {
  const [previewData, setPreviewData] = useState<CasingSchematicView>();

  const filteredData = useMemo(
    () => filterCasingsByWellOrWellboreName(data, searchPhrase),
    [data, searchPhrase]
  );

  if (isEmpty(filteredData)) {
    return <EmptyState emptyTitle={NO_RESULTS_TEXT} />;
  }

  return (
    <>
      <CasingsWellsTable data={filteredData} onPreviewClick={setPreviewData} />

      <CasingPreview
        data={previewData}
        onBackClick={() => setPreviewData(undefined)}
      />
    </>
  );
};
