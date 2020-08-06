import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import { SequencePreview } from './SequencePreview';

export const SequenceExplorer = () => {
  const dispatch = useDispatch();
  const { sequenceId } = useParams<{
    sequenceId: string | undefined;
  }>();
  const sequenceIdNumber = sequenceId ? parseInt(sequenceId, 10) : undefined;

  useEffect(() => {
    trackUsage('Exploration.Sequence', { sequenceId: sequenceIdNumber });
  }, [sequenceIdNumber]);

  useEffect(() => {
    if (sequenceIdNumber) {
      (async () => {
        await dispatch(retrieveFile([{ id: sequenceIdNumber }]));
        await dispatch(listByFileId(sequenceIdNumber));
      })();
    }
  }, [dispatch, sequenceIdNumber]);

  if (!sequenceIdNumber) {
    return <Loader />;
  }
  return <SequencePreview sequenceId={sequenceIdNumber} />;
};
