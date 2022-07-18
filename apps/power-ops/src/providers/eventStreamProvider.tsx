import {
  useState,
  createContext,
  useEffect,
  PropsWithChildren,
  ReactNode,
} from 'react';
import sidecar from 'utils/sidecar';
import { Observable, fromEvent, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SnifferEvent } from '@cognite/power-ops-api-types';
import { useAuthContext } from '@cognite/react-container';
import { CogniteEvent } from '@cognite/sdk';

export interface EventStreamContextType {
  eventStore?: Observable<CogniteEvent>;
}

export const EventStreamContext = createContext<EventStreamContextType>({});

export const EventStreamProvider: React.FC<
  PropsWithChildren<{ children: ReactNode }>
> = ({ children }) => {
  const { client } = useAuthContext();
  const { powerOpsApiBaseUrl } = sidecar;
  const eventsSourceURL = `${powerOpsApiBaseUrl}/sse`;

  const [eventContextValue, setEventContextValue] =
    useState<EventStreamContextType>({});

  useEffect(() => {
    const source = new EventSource(eventsSourceURL, {
      withCredentials: false,
    });

    if (client) {
      const observable = fromEvent<MessageEvent>(source, client.project).pipe(
        switchMap((e) => {
          const snifferEvent: SnifferEvent = JSON.parse(e.data);
          return from(client.events.retrieve([{ id: snifferEvent.id }])).pipe(
            map((events) => {
              const [event] = events;
              return event;
            })
          );
        })
      );

      setEventContextValue({ eventStore: observable });
    }
    return () => {
      source?.close();
    };
  }, [client]);

  const { Provider } = EventStreamContext;

  return <Provider value={eventContextValue}>{children}</Provider>;
};
