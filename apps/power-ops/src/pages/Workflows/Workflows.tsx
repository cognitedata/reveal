import { memo, useContext, useEffect } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient, CogniteEvent, Relationship } from '@cognite/sdk';
import { EVENT_TYPES, PROCESS_TYPES } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchWorkflows } from 'queries/useFetchWorkflows';

import { WorkflowSingle } from './WorkflowSingle';
import { ReusableTable } from './ReusableTable';
import { TableContainer } from './elements';
import { workflowsColumns } from './utils';

const WorkflowsWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client, authState }: AuthContext) =>
      client ? <WorkflowsPage client={client} authState={authState} /> : null
    }
  </AuthConsumer>
);

const WorkflowsPage = ({
  client,
  authState,
}: {
  client: CogniteClient;
  authState: AuthenticatedUser | undefined;
}) => {
  const { eventStore } = useContext(EventStreamContext);

  const match = useRouteMatch();

  const { data: workflows, refetch: refetchWorkflows } = useFetchWorkflows({
    project: client.project,
    token: authState?.token,
  });

  const processEvent = async (
    event: CogniteEvent,
    relationshipsAsTarget: Relationship[]
  ): Promise<void> => {
    switch (event.type) {
      case PROCESS_TYPES.BID_PROCESS:
        refetchWorkflows();
        break;
      case EVENT_TYPES.PROCESS_STARTED:
      case EVENT_TYPES.PROCESS_FAILED:
      case EVENT_TYPES.PROCESS_FINISHED:
        // For status Events, we check that they are attached to (parent) Bid Processes and not to sub-processes.
        if (
          relationshipsAsTarget.some((rel) =>
            rel.sourceExternalId.includes(PROCESS_TYPES.BID_PROCESS)
          )
        )
          refetchWorkflows();
        break;
    }
  };

  useEffect(() => {
    const subscription = eventStore?.subscribe(
      ({ event, relationshipsAsTarget }) => {
        processEvent(event, relationshipsAsTarget);
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <TableContainer>
          {workflows && (
            <ReusableTable data={workflows} columns={workflowsColumns} />
          )}
        </TableContainer>
      </Route>
      <Route
        exact
        path={`${match.path}/:workflowExternalId`}
        render={({ match: { params } }) => {
          return (
            params?.workflowExternalId && (
              <WorkflowSingle
                client={client}
                workflowExternalId={params.workflowExternalId}
                authState={authState}
              />
            )
          );
        }}
      />
    </Switch>
  );
};

export const Workflows = memo(WorkflowsWrapper);
