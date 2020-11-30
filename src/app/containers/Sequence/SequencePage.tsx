import React from 'react';
import { useParams } from 'react-router-dom';
import { SequencePreview } from './SequencePreview';

export const SequencePage = () => {
  const { id: sequenceIdString } = useParams<{
    id: string;
  }>();
  const sequenceId = parseInt(sequenceIdString, 10);

  if (!sequenceIdString) {
    return null;
  }

  return (
    <SequencePreview
      sequenceId={sequenceId}
      actions={['Download', 'Collections', 'Copy']}
    />
  );
};
