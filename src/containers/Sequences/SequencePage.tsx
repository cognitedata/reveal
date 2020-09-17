import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveSequences } from '@cognite/cdf-resources-store/dist/sequences';
import { useResourcesDispatch } from '@cognite/cdf-resources-store';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { SequencePreview } from './SequencePreview';

export const SequencePage = () => {
  const dispatch = useResourcesDispatch();
  const { sequenceId } = useParams<{
    sequenceId: string | undefined;
  }>();
  const sequenceIdNumber = sequenceId ? parseInt(sequenceId, 10) : undefined;

  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const { hidePreview } = useResourcePreview();
  const isActive = resourcesState.some(
    el =>
      el.state === 'active' &&
      el.id === sequenceIdNumber &&
      el.type === 'sequence'
  );

  useEffect(() => {
    if (sequenceIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: sequenceIdNumber, type: 'sequence', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, sequenceIdNumber, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.Sequence', { sequenceId: sequenceIdNumber });
  }, [sequenceIdNumber]);

  useEffect(() => {
    if (sequenceIdNumber) {
      (async () => {
        await dispatch(retrieveSequences([{ id: sequenceIdNumber }]));
      })();
    }
    hidePreview();
  }, [dispatch, sequenceIdNumber, hidePreview]);

  if (!sequenceIdNumber) {
    return <Loader />;
  }
  return <SequencePreview sequenceId={sequenceIdNumber} />;
};
