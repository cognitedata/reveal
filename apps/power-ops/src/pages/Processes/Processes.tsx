import { memo, useContext, useEffect, useMemo } from 'react';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import { EVENT_TYPES, SnifferEvent } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchProcesses } from 'queries/useFetchProcesses';

import { TableContainer } from './elements';
import ProcessList from './ProcessList';

export type Process = {
  id: number;
  cdfProject: string;
  collectionId: number;
  eventCreationTime: string;
  eventStartTime: string;
  eventEndTime: string;
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
      EVENT_TYPES.BID_PROCESS,
      EVENT_TYPES.SHOP_RUN,
      EVENT_TYPES.FUNCTION_CALL,
    ],
    token: authState?.token,
  });

  const processEvent = async (e: SnifferEvent): Promise<void> => {
    if (!e.id) return;

    const event = (await client?.events.retrieve([{ id: e.id }]))?.[0];
    if (!event) return;

    switch (event.type) {
      case EVENT_TYPES.BID_PROCESS:
      case EVENT_TYPES.SHOP_RUN:
      case EVENT_TYPES.FUNCTION_CALL:
      case EVENT_TYPES.PROCESS_STARTED:
      case EVENT_TYPES.PROCESS_FAILED:
      case EVENT_TYPES.PROCESS_FINISHED:
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

  useEffect(() => {
    refetchProcesses();
  }, []);

  return (
    <TableContainer>
      <ProcessList
        processes={useMemo(
          () => processes?.filter((p) => p.eventCreationTime),
          [processes]
        )}
      />
    </TableContainer>
  );
};

export const Processes = memo(ProcessWrapper);
