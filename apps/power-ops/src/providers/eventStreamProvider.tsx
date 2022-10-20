import {
  createContext,
  useContext,
  useEffect,
  PropsWithChildren,
  useState,
  SetStateAction,
  Dispatch,
  useMemo,
} from 'react';
import sidecar from 'utils/sidecar';
import { Subject, fromEvent } from 'rxjs';
import { SnifferRequestPayload } from '@cognite/sniffer-service-types';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { CogniteEvent, Relationship } from '@cognite/sdk';

export interface EventStreamContextType {
  eventStore: Subject<{
    event: CogniteEvent;
    relationshipsAsSource: Relationship[];
    relationshipsAsTarget: Relationship[];
  }>;
  newMatrixAvailable: boolean;
  setNewMatrixAvailable: Dispatch<SetStateAction<boolean>>;
}

export const EventStreamContext = createContext<EventStreamContextType>({
  eventStore: new Subject(),
  newMatrixAvailable: false,
  setNewMatrixAvailable: () => null,
});

const source = new EventSource(`${sidecar.powerOpsApiBaseUrl}/sse`, {
  withCredentials: false,
});

export const EventStreamProvider = ({ children }: PropsWithChildren) => {
  const { client, project } = useAuthenticatedAuthContext();
  const [newMatrixAvailable, setNewMatrixAvailable] = useState(false);

  const eventEmitter = fromEvent<MessageEvent<string>>(source, project);
  const { eventStore } = useContext(EventStreamContext);

  useEffect(() => {
    const subscription = eventEmitter.subscribe(async (e) => {
      const snifferEvent = JSON.parse(e.data) as SnifferRequestPayload;
      const [event] = await client.events.retrieve([{ id: snifferEvent.id }]);
      const [
        { items: relationshipsAsSource = [] },
        { items: relationshipsAsTarget = [] },
      ] = await Promise.all([
        client.relationships.list({
          filter: { sourceExternalIds: [event.externalId!] },
        }),
        client.relationships.list({
          filter: {
            targetExternalIds: [event.externalId!],
          },
        }),
      ]);
      eventStore.next({
        event,
        relationshipsAsSource,
        relationshipsAsTarget,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const contextValue = useMemo(
    () => ({ eventStore, newMatrixAvailable, setNewMatrixAvailable }),
    [eventStore, newMatrixAvailable, setNewMatrixAvailable]
  );

  return (
    <EventStreamContext.Provider value={contextValue}>
      {children}
    </EventStreamContext.Provider>
  );
};
