import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { SequencePreview } from './SequencePreview';

export const SequenceExplorer = () => {
  const dispatch = useDispatch();
  const { sequenceId } = useParams<{
    sequenceId: string | undefined;
  }>();
  const sequenceIdNumber = sequenceId ? parseInt(sequenceId, 10) : undefined;

  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el =>
      el.state === 'active' &&
      el.id === sequenceIdNumber &&
      el.type === 'sequences'
  );

  useEffect(() => {
    if (sequenceIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([
            { id: sequenceIdNumber, type: 'sequences', state: 'active' },
          ])
      );
    }
  }, [isActive, resourcesState, sequenceIdNumber, setResourcesState]);

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
