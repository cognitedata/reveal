import React from 'react';
import { useParams } from 'react-router-dom';

import { PageTitle } from '@cognite/cdf-utilities';
import { Sequence } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { SequencePreview } from './SequencePreview';

export const SequencePage = () => {
  const { id: sequenceIdString = '' } = useParams<{
    id: string;
  }>();
  const sequenceId = parseInt(sequenceIdString, 10);

  const { data: sequence } = useCdfItem<Sequence>('sequences', {
    id: sequenceId,
  });

  if (!sequenceIdString) {
    return null;
  }

  return (
    <>
      <PageTitle title={sequence?.name} />
      <SequencePreview sequenceId={sequenceId} />
    </>
  );
};
