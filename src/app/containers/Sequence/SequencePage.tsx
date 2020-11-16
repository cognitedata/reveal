import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { SequencePreview } from './SequencePreview';

export const SequencePage = () => {
  const { id: sequenceIdString } = useParams<{
    id: string;
  }>();
  const sequenceId = parseInt(sequenceIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.SequencePage', { sequenceId });
  }, [sequenceId]);

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
