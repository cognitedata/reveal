import { EVENT_TYPES, POWEROPS_LABELS } from '@cognite/power-ops-api-types';
import { CogniteClient, CogniteEvent, Relationship } from '@cognite/sdk';
import { useContext, useEffect, useState } from 'react';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { useFetchProcesses } from 'queries/useFetchProcesses';
import { useFetchEventRelationships } from 'queries/useFetchEventRelationships';
import { Button, Collapse, Table, TableData } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { calculateDuration } from 'utils/utils';
import { Process } from 'types';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ProcessList from 'pages/Processes/ProcessList';
import StatusLabel from 'components/StatusLabel/StatusLabel';
import { EventStreamContext } from 'providers/eventStreamProvider';

import {
  Header,
  FlexContainer,
  Container,
  CollapseContainer,
} from './elements';

export const BidProcessPage = ({
  client,
  process,
  authState,
}: {
  client: CogniteClient;
  process: Process;
  authState: AuthenticatedUser | undefined;
}) => {
  const { eventStore } = useContext(EventStreamContext);

  const match = useRouteMatch();
  const history = useHistory();

  const [bidProcessEvent, setBidProcessEvent] = useState<
    CogniteEvent | undefined
  >();
  const [bidProcessMetadata, setBidProcessMetadata] = useState<TableData[]>();
  const [duration, setDuration] = useState<string>('');
  const [subProcesses, setSubProcesses] = useState<Process[] | undefined>();

  // Get all FUNCTION_CALL and SHOP_RUN process events
  const { data: allSubProcesses, refetch: refetchSubProcesses } =
    useFetchProcesses({
      project: client.project,
      processTypes: [EVENT_TYPES.FUNCTION_CALL, EVENT_TYPES.SHOP_RUN],
      token: authState?.token,
    });

  // Get relationships of process event
  const {
    data: processEventRelationships,
    refetch: refetchProcessEventRelationships,
  } = useFetchEventRelationships({
    client,
    labels: [
      { externalId: POWEROPS_LABELS.SHOP_RUN_LABEL },
      { externalId: POWEROPS_LABELS.PARTIAL_MATRIX_PROCESS_LABEL },
      { externalId: POWEROPS_LABELS.TOTAL_MATRIX_LABEL },
    ],
    sourceExternalId: process.eventExternalId,
  });

  // Get bid process metadata and dataSetId
  const getBidProcess = async () => {
    if (process.eventExternalId) {
      const [processEvent] = await client.events.retrieve([
        { externalId: process.eventExternalId },
      ]);

      if (processEvent) {
        setBidProcessEvent(processEvent);
        if (processEvent.metadata && processEvent.dataSetId) {
          setBidProcessMetadata(
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
    // Check that the event is part of Bid Process by checking its relationships
    if (process.eventExternalId) {
      const partOfBidProcess = [
        ...relationshipsAsSource,
        ...relationshipsAsTarget,
      ].some((rel) =>
        [rel.sourceExternalId, rel.targetExternalId].includes(
          process.eventExternalId
        )
      );

      if (partOfBidProcess) {
        switch (event.type) {
          case EVENT_TYPES.SHOP_RUN:
          case EVENT_TYPES.FUNCTION_CALL:
          case EVENT_TYPES.PROCESS_STARTED:
          case EVENT_TYPES.PROCESS_FAILED:
          case EVENT_TYPES.PROCESS_FINISHED:
            refetchSubProcesses();
            refetchProcessEventRelationships();
            break;
        }
      }
    }
  };

  const subscription = eventStore?.subscribe(
    ({ event, relationshipsAsSource, relationshipsAsTarget }) => {
      processEvent(event, relationshipsAsSource, relationshipsAsTarget);
    }
  );

  useEffect(() => {
    getBidProcess();
  }, [process.eventExternalId]);

  useEffect(() => {
    // Calculate bid process duration
    if (bidProcessEvent?.startTime && bidProcessEvent?.endTime)
      setDuration(
        calculateDuration(
          bidProcessEvent.startTime.toString(),
          bidProcessEvent.endTime.toString()
        )
      );
  }, [bidProcessEvent]);

  useEffect(() => {
    // Shop runs and function calls for this bid process
    const processesOfParentProcess = allSubProcesses?.filter((subprocess) =>
      processEventRelationships
        ?.map((rel) => rel.targetExternalId)
        ?.includes(subprocess.eventExternalId)
    );
    setSubProcesses(processesOfParentProcess);
  }, [processEventRelationships, allSubProcesses]);

  useEffect(() => {
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <div>
      <Header>
        <Button
          icon="ArrowLeft"
          aria-label="Back Button"
          onClick={() =>
            history.push(match.path.slice(0, match.path.lastIndexOf('/')))
          }
        />
        {bidProcessEvent?.externalId && (
          <>
            <h1>Bid Process</h1>
            <StatusLabel status={process.status} />
          </>
        )}
      </Header>
      <Container>
        <FlexContainer>
          <span>
            <h2>External ID</h2>
            <p>{bidProcessEvent?.externalId}</p>
          </span>
          <span>
            <h2>Data set ID</h2>
            <p>{bidProcessEvent?.dataSetId}</p>
          </span>
          <span>
            <h2>Start time</h2>
            <p>
              {bidProcessEvent?.startTime &&
                dayjs(bidProcessEvent?.startTime).format('YYYY-MM-DD HH:mm:ss')}
            </p>
          </span>
          <span>
            <h2>End time</h2>
            <p>
              {bidProcessEvent?.endTime &&
                dayjs(bidProcessEvent?.endTime).format('YYYY-MM-DD HH:mm:ss')}
            </p>
          </span>
          <span>
            <h2>Duration</h2>
            <p>{duration}</p>
          </span>
        </FlexContainer>
        <CollapseContainer>
          <Collapse.Panel header="Metadata">
            {bidProcessMetadata && (
              <Table
                pagination={false}
                columns={[
                  {
                    accessor: 'key',
                    Header: 'Key',
                  },
                  {
                    accessor: 'value',
                    Header: 'Value',
                  },
                ]}
                dataSource={bidProcessMetadata}
              />
            )}
          </Collapse.Panel>
        </CollapseContainer>
        <h2>Events</h2>
        <div className="eventsTable">
          {subProcesses && <ProcessList processes={subProcesses} />}
        </div>
      </Container>
    </div>
  );
};
