import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { CogniteClient, CogniteEvent, Relationship } from '@cognite/sdk';
import { AuthenticatedUser } from '@cognite/auth-utils';
import {
  Button,
  Collapse,
  Detail,
  Icon,
  Input,
  TableData,
} from '@cognite/cogs.js';
import { EVENT_TYPES } from '@cognite/power-ops-api-types';
import { calculateDuration } from 'utils/utils';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { CopyButton } from 'components/CopyButton/CopyButton';
import { useFetchProcesses } from 'queries/useFetchProcesses';

import { ReusableTable } from './ReusableTable';
import { handleCopyButtonClick, processColumns } from './utils';
import {
  Header,
  FlexContainer,
  Container,
  MetadataContainer,
  CollapseContainer,
} from './elements';

export const WorkflowSingle = ({
  client,
  workflowExternalId,
  authState,
}: {
  client: CogniteClient;
  workflowExternalId: string;
  authState: AuthenticatedUser | undefined;
}) => {
  const { eventStore } = useContext(EventStreamContext);

  const match = useRouteMatch();
  const history = useHistory();

  const [workflowEvent, setWorkflowEvent] = useState<
    CogniteEvent | undefined
  >();
  const [workflowEventMetadata, setWorkflowEventMetadata] =
    useState<TableData[]>();
  const [duration, setDuration] = useState<string>('');

  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  const { data: processes, refetch: refetchProcesses } = useFetchProcesses({
    project: client.project,
    workflowExternalId,
    token: authState?.token,
  });

  // Get bid workflow metadata and dataSetId
  const getWorkflowEvent = async () => {
    if (workflowExternalId) {
      const [processEvent] = await client.events.retrieve([
        { externalId: workflowExternalId },
      ]);

      if (processEvent) {
        setWorkflowEvent(processEvent);
        if (processEvent.metadata && processEvent.dataSetId) {
          setWorkflowEventMetadata(
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
    <div>
      <Header>
        <Button
          icon="ArrowLeft"
          aria-label="Back Button"
          onClick={() =>
            history.push(match.path.slice(0, match.path.lastIndexOf('/')))
          }
        />
        {workflowEvent?.externalId && (
          <>
            <div>
              <span className="cogs-title-5">Processes</span>
              <Detail strong>Workflow type: {workflowEvent?.type}</Detail>
            </div>
            {/* <StatusLabel size="large" status={workflow.status} /> */}
          </>
        )}
      </Header>
      <FlexContainer>
        {workflowEvent?.externalId && (
          <div className="external-id">
            <p className="cogs-body-2 strong">External ID</p>
            <Input
              value={workflowEvent.externalId}
              postfix={
                <CopyButton
                  copyFunction={() =>
                    handleCopyButtonClick(workflowEvent.externalId)
                  }
                  className="cogs-btn-tiny"
                />
              }
              disabled
              size="small"
            />
          </div>
        )}
        <MetadataContainer>
          <span>
            <p className="cogs-body-2 strong">Workflow Type</p>
            <p className="cogs-body-2">{workflowEvent?.type}</p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Finished/Failed</p>
            <p className="cogs-body-2">
              {workflowEvent?.endTime &&
                dayjs(workflowEvent?.endTime).format('DD MMM, YYYY HH:mm:ss')}
            </p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Duration</p>
            <p className="cogs-body-2">{duration}</p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Started</p>
            <p className="cogs-body-2">
              {workflowEvent?.startTime &&
                dayjs(workflowEvent?.startTime).format('DD MMM, YYYY HH:mm:ss')}
            </p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Triggered</p>
            <p className="cogs-body-2">
              {workflowEvent?.createdTime &&
                dayjs(workflowEvent?.createdTime).format(
                  'DD MMM, YYYY HH:mm:ss'
                )}
            </p>
          </span>
        </MetadataContainer>
      </FlexContainer>
      <Container>
        <CollapseContainer onChange={() => setShowMetadata(!showMetadata)}>
          <Collapse.Panel
            showArrow={false}
            header={
              <>
                <p className="cogs-body-2 strong">Metadata</p>
                <Icon
                  type="ChevronDown"
                  style={{
                    transform: `rotate(${!showMetadata ? 0 : -180}deg)`,
                  }}
                />
              </>
            }
          >
            <MetadataContainer>
              {workflowEventMetadata &&
                workflowEventMetadata.map((data) => (
                  <span key={data.id}>
                    <p className="cogs-body-2 strong">{data.key}</p>
                    <p className="cogs-body-2">{data.value}</p>
                  </span>
                ))}
            </MetadataContainer>
          </Collapse.Panel>
        </CollapseContainer>
        <div className="eventsTable">
          {processes && (
            <ReusableTable data={processes} columns={processColumns} />
          )}
        </div>
      </Container>
    </div>
  );
};
