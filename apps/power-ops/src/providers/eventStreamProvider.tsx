import {
  useState,
  createContext,
  useContext,
  useEffect,
  PropsWithChildren,
  ReactNode,
} from 'react';
import sidecar from 'utils/sidecar';
import { Observable, Subject, fromEvent } from 'rxjs';
import { SnifferEvent } from '@cognite/power-ops-api-types';
import { useAuthContext } from '@cognite/react-container';
import { CogniteEvent, Relationship } from '@cognite/sdk';

export interface EventStreamContextType {
  eventStore?: Subject<{
    event: CogniteEvent;
    relationshipsAsSource: Relationship[];
    relationshipsAsTarget: Relationship[];
  }>;
}

export const EventStreamContext = createContext<EventStreamContextType>({
  eventStore: new Subject(),
});

export const EventStreamProvider: React.FC<
  PropsWithChildren<{ children: ReactNode }>
> = ({ children }) => {
  const { client } = useAuthContext();

  const [eventEmitter, setEventEmitter] =
    useState<Observable<MessageEvent> | null>(null);
  const eventStreamContext = useContext(EventStreamContext);

  useEffect(() => {
    if (client?.project && !eventEmitter) {
      const source = new EventSource(`${sidecar.powerOpsApiBaseUrl}/sse`, {
        withCredentials: false,
      });
      setEventEmitter(fromEvent<MessageEvent>(source, client.project));
    }
  }, [client]);

  useEffect(() => {
    const subscription = eventEmitter?.subscribe(async (e) => {
      const snifferEvent: SnifferEvent = JSON.parse(e.data);

      if (client) {
        const [event] = await client.events.retrieve([{ id: snifferEvent.id }]);

        const [
          { items: relationshipsAsSource },
          { items: relationshipsAsTarget },
        ] = await Promise.all([
          client.relationships.list({
            filter: {
              sourceExternalIds: [event.externalId!],
            },
          }),
          client.relationships.list({
            filter: {
              targetExternalIds: [event.externalId!],
            },
          }),
        ]);

        eventStreamContext?.eventStore?.next({
          event,
          relationshipsAsSource: relationshipsAsSource || [],
          relationshipsAsTarget: relationshipsAsTarget || [],
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [eventEmitter]);

  const { Provider } = EventStreamContext;

  return <Provider value={eventStreamContext}>{children}</Provider>;
};
