import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'utils/Metrics';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { SequencePreview } from './SequencePreview';

export const SequencePage = () => {
  const { sequenceId } = useParams<{
    sequenceId: string | undefined;
  }>();
  const sequenceIdNumber = sequenceId ? parseInt(sequenceId, 10) : undefined;
  const validId =
    !!sequenceId && !!sequenceIdNumber && Number.isFinite(sequenceIdNumber);

  const { hidePreview } = useResourcePreview();
  useEffect(() => {
    trackUsage('Exploration.Sequence', { sequenceId: sequenceIdNumber });
  }, [sequenceIdNumber]);

  useEffect(() => {
    hidePreview();
  }, [sequenceIdNumber, hidePreview]);

  if (!validId) {
    return null;
  }
  return <SequencePreview sequenceId={sequenceIdNumber!} />;
};
