import { memo, useContext, useEffect, useMemo } from 'react';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import { SnifferEvent } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchProcesses } from 'queries/useFetchProcesses';

import { Container } from '../elements';

import ProcessList from './ProcessList';

export type Process = {
  id: number;
  collectionId: number;
  eventCreationTime: string;
  eventExternalId: string;
  eventType: string;
  status: string;
};

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

  const { data: processes, refetch: refetchProcesses } = useFetchProcesses({
    project: client.project,
    processTypes: [
      'POWEROPS_BID_PROCESS',
      'POWEROPS_SHOP_RUN',
      'POWEROPS_FUNCTIONAL_CALL',
    ],
    token: authState?.token,
  });

  const processEvent = async (e: SnifferEvent): Promise<void> => {
    if (!e.id) return;

    const event = (await client?.events.retrieve([{ id: e.id }]))?.[0];
    if (!event) return;

    switch (event.type) {
      case 'POWEROPS_BID_PROCESS':
      case 'POWEROPS_SHOP_RUN':
      case 'POWEROPS_FUNCTIONAL_CALL':
      case 'POWEROPS_PROCESS_FAILED':
      case 'POWEROPS_PROCESS_FINISHED':
        refetchProcesses();
        break;
    }
  };

  useEffect(() => {
    const subscription = eventStore?.subscribe((event) => {
      processEvent(event);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [processEvent]);

  return (
    <Container
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <ProcessList
        processes={useMemo(
          () => processes?.filter((p) => p.eventCreationTime),
          [processes]
        )}
      />
    </Container>
  );
};

export const Processes = memo(ProcessWrapper);
