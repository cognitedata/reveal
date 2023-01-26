import { useContext, useEffect, useState } from 'react';
import { CogniteEvent, Relationship } from '@cognite/sdk';
import { TableData } from '@cognite/cogs.js-v9';
import { EVENT_TYPES } from '@cognite/power-ops-api-types';
import { calculateDuration } from 'utils/utils';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom-v5';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchProcesses } from 'queries/useFetchProcesses';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

import { WorkflowSingle } from './WorkflowSingle';

export const WorkflowSingleContainer = () => {
  const { client } = useAuthenticatedAuthContext();
  const { eventStore } = useContext(EventStreamContext);

  const match = useRouteMatch();
  const history = useHistory();
  const { workflowExternalId } = useParams<{ workflowExternalId: string }>();

  const [workflowEvent, setWorkflowEvent] = useState<
    CogniteEvent | undefined
  >();
  const [workflowMetadata, setWorkflowMetadata] = useState<TableData[]>();
  const [duration, setDuration] = useState<string>('');

  const { data: processes, refetch: refetchProcesses } =
    useFetchProcesses(workflowExternalId);

  const handleBackButtonClick = () => {
    history.push(match.path.slice(0, match.path.lastIndexOf('/')));
  };

  // Get bid workflow metadata and dataSetId
  const getWorkflowEvent = async () => {
    if (workflowExternalId) {
      const [processEvent] = await client.events.retrieve([
        { externalId: workflowExternalId },
      ]);

      if (processEvent) {
        setWorkflowEvent(processEvent);
        if (processEvent.metadata && processEvent.dataSetId) {
          setWorkflowMetadata(
            Object.entries(processEvent?.metadata).map(([key, value]) => {
              return { id: key, key, value };
            })
          );
        }
      }
    }
  };

  const processEvent = async (
    event: CogniteEvent,
    relationshipsAsSource: Relationship[],
    relationshipsAsTarget: Relationship[]
  ): Promise<void> => {
    // Check that the event is part of Bid Workflow by checking its relationships
    if (workflowExternalId) {
      const partOfWorkflowEvent = [
        ...relationshipsAsSource,
        ...relationshipsAsTarget,
      ].some((rel) =>
        [rel.sourceExternalId, rel.targetExternalId].includes(
          workflowExternalId
        )
      );

      if (partOfWorkflowEvent) {
        switch (event.type) {
          case EVENT_TYPES.PROCESS_REQUESTED:
          case EVENT_TYPES.PROCESS_STARTED:
          case EVENT_TYPES.PROCESS_FAILED:
          case EVENT_TYPES.PROCESS_FINISHED:
            refetchProcesses({ cancelRefetch: true });
            break;
        }
      }
    }
  };

  useEffect(() => {
    getWorkflowEvent();
  }, [workflowExternalId]);

  useEffect(() => {
    // Calculate bid workflow duration
    if (workflowEvent?.startTime && workflowEvent?.endTime)
      setDuration(
        calculateDuration(
          workflowEvent.startTime.toString(),
          workflowEvent.endTime.toString()
        )
      );
  }, [workflowEvent]);

  useEffect(() => {
    refetchProcesses({ cancelRefetch: true });
    const subscription = eventStore?.subscribe(
      ({ event, relationshipsAsSource, relationshipsAsTarget }) => {
        processEvent(event, relationshipsAsSource, relationshipsAsTarget);
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <WorkflowSingle
      workflowEvent={workflowEvent}
      duration={duration}
      workflowMetadata={workflowMetadata}
      processes={processes}
      handleBackButtonClick={handleBackButtonClick}
    />
  );
};
