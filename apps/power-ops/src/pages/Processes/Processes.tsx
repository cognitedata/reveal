import { memo, useContext, useEffect } from 'react';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient, CogniteEvent, Relationship } from '@cognite/sdk';
import { EVENT_TYPES } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchProcesses } from 'queries/useFetchProcesses';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { BidProcessPage } from 'pages/BidProcessPage';

import { TableContainer } from './elements';
import ProcessList from './ProcessList';

const ProcessWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client, authState }: AuthContext) =>
      client ? <ProcessesPage client={client} authState={authState} /> : null
    }
  </AuthConsumer>
);

const ProcessesPage = ({
  client,
  authState,
}: {
  client: CogniteClient;
  authState: AuthenticatedUser | undefined;
}) => {
  const { eventStore } = useContext(EventStreamContext);

  const match = useRouteMatch();

  const { data: processes, refetch: refetchProcesses } = useFetchProcesses({
    project: client.project,
    processTypes: [EVENT_TYPES.BID_PROCESS],
    token: authState?.token,
  });

  const processEvent = async (
    event: CogniteEvent,
    relationshipsAsTarget: Relationship[]
  ): Promise<void> => {
    switch (event.type) {
      case EVENT_TYPES.BID_PROCESS:
        refetchProcesses();
        break;
      case EVENT_TYPES.PROCESS_STARTED:
      case EVENT_TYPES.PROCESS_FAILED:
      case EVENT_TYPES.PROCESS_FINISHED:
        // For status Events, we check that they are attached to (parent) Bid Processes and not to sub-processes.
        if (
          relationshipsAsTarget.some((rel) =>
            rel.sourceExternalId.includes(EVENT_TYPES.BID_PROCESS)
          )
        )
          refetchProcesses();
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
          {processes && (
            <ProcessList processes={processes} className="all-processes" />
          )}
        </TableContainer>
      </Route>
      <Route
        exact
        path={`${match.path}/:bidProcessExternalId`}
        render={(props) => {
          const process = processes?.find(
            (process) =>
              process.eventExternalId ===
              props.match.params.bidProcessExternalId
          );
          return (
            process && (
              <BidProcessPage
                client={client}
                process={process}
                authState={authState}
              />
            )
          );
        }}
      />
    </Switch>
  );
};

export const Processes = memo(ProcessWrapper);
