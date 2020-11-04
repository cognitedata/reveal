import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import { SequencePreview } from 'lib/containers/Sequences';
import ResourceTitleRow from 'app/components/ResourceTitleRow';

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

  if (!validId || !sequenceIdNumber) {
    return null;
  }
  return (
    <>
      <ResourceTitleRow
        id={sequenceIdNumber}
        type="sequence"
        icon="GridFilled"
      />
      <SequencePreview sequenceId={sequenceIdNumber!} />
    </>
  );
};
