import { Tooltip } from '@cognite/cogs.js';
import { EVENT_TYPES, POWEROPS_LABELS } from '@cognite/power-ops-api-types';
import { CogniteEvent, Relationship } from '@cognite/sdk';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchEventRelationships } from 'queries/useFetchEventRelationships';
import { useFetchProcessStatusEvents } from 'queries/useFetchProcessStatusEvents';
import { useContext, useEffect, useState } from 'react';
import { Statuses } from 'types';
import { useAuthContext } from '@cognite/react-container';

import { StatusIcon, SubProcess } from './elements';

const SubProcessStatuses = ({
  processEventExternalId,
}: {
  processEventExternalId: string;
}) => {
  const { client } = useAuthContext();
  const { eventStore } = useContext(EventStreamContext);

  const {
    data: parentProcessEventRelationships,
    refetch: refetchParentProcessRelationships,
  } = useFetchEventRelationships({
    client,
    labels: [
      { externalId: POWEROPS_LABELS.SHOP_RUN_LABEL },
      { externalId: POWEROPS_LABELS.PARTIAL_MATRIX_PROCESS_LABEL },
      { externalId: POWEROPS_LABELS.TOTAL_MATRIX_LABEL },
    ],
    sourceExternalId: processEventExternalId,
  });

  const { data: subProcessStatusEvents, refetch: refetchProcessStatusEvents } =
    useFetchProcessStatusEvents({
      client,
      sourceExternalIds: parentProcessEventRelationships?.map(
        (rel) => rel.targetExternalId
      ),
    });

  const [eventStatuses, setEventStatuses] = useState<Statuses>({
    failed: 0,
    finished: 0,
    running: 0,
    triggered: 0,
  });

  const subscription = eventStore?.subscribe(
    ({ event, relationshipsAsTarget }) => {
      switch (event.type) {
        case EVENT_TYPES.PROCESS_STARTED:
        case EVENT_TYPES.PROCESS_FAILED:
        case EVENT_TYPES.PROCESS_FINISHED:
          handleStatusEvent(event);
          break;
        case EVENT_TYPES.SHOP_RUN:
        case EVENT_TYPES.FUNCTION_CALL:
          handleSubProcessEvent(relationshipsAsTarget);
          break;
      }
    }
  );

  const handleStatusEvent = async (
    statusEvent: CogniteEvent
  ): Promise<void> => {
    if (statusEvent.metadata?.event_external_id) {
      if (
        // check if status event is part of sub-process
        parentProcessEventRelationships
          ?.map((rel) => rel.targetExternalId)
          .includes(statusEvent.metadata.event_external_id)
      ) {
        refetchProcessStatusEvents();
      }
    }
  };

  const handleSubProcessEvent = async (
    relationshipsAsTarget: Relationship[]
  ): Promise<void> => {
    if (
      relationshipsAsTarget.some(
        (rel) => rel.sourceExternalId === processEventExternalId
      )
    ) {
      refetchParentProcessRelationships();
    }
  };

  useEffect(() => {
    if (subProcessStatusEvents) {
      let finished = 0;
      let failed = 0;
      let triggered = 0;
      let running = 0;

      Object.values(subProcessStatusEvents).forEach(
        ({ statusEventExternalId }) => {
          if (statusEventExternalId.includes('FINISHED')) {
            finished += 1;
          } else if (statusEventExternalId.includes('FAILED')) {
            failed += 1;
          } else if (statusEventExternalId.includes('TRIGGERED')) {
            triggered += 1;
          } else if (statusEventExternalId.includes('STARTED')) {
            running += 1;
          }
        }
      );

      setEventStatuses({
        failed,
        finished,
        running,
        triggered,
      });
    }
  }, [subProcessStatusEvents]);

  useEffect(() => {
    return () => {
      subscription?.unsubscribe();
    };
  }, [eventStore]);

  return (
    <SubProcess>
      <Tooltip content="Triggered">
        <StatusIcon type="Stop" className="triggered" />
      </Tooltip>
      {eventStatuses.triggered}
      <Tooltip content="Running">
        <StatusIcon type="Stop" className="running" />
      </Tooltip>
      {eventStatuses.running}
      <Tooltip content="Finished">
        <StatusIcon type="Stop" className="finished" />
      </Tooltip>
      {eventStatuses.finished}
      <Tooltip content="Failed">
        <StatusIcon type="Stop" className="failed" />
      </Tooltip>
      {eventStatuses.failed}
    </SubProcess>
  );
};

export default SubProcessStatuses;
