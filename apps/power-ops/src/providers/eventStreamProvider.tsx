import { useState, createContext, useEffect } from 'react';
import sidecar from 'utils/sidecar';
import { Observable } from 'rxjs';
import { SnifferEvent } from '@cognite/power-ops-api-types';
import { useAuthContext } from '@cognite/react-container';
import { CogniteEvent } from '@cognite/sdk';

export interface EventStreamContextType {
  eventStore?: Observable<CogniteEvent>;
}

export const EventStreamContext = createContext<EventStreamContextType>({});

export const EventStreamProvider: React.FC = ({ children }) => {
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
      const observable = new Observable<CogniteEvent>((subscriber) => {
        source.addEventListener(client.project, async (e: MessageEvent) => {
          const snifferEvent: SnifferEvent = JSON.parse(e.data);
          if (!snifferEvent?.id) return;

          const [event] = await client.events.retrieve([
            { id: snifferEvent.id },
          ]);
          if (!event) return;

          subscriber.next(event);
        });
      });

      setEventContextValue({ eventStore: observable });
    }
    return () => {
      source?.close();
    };
  }, [client]);

  const { Provider } = EventStreamContext;

  return <Provider value={eventContextValue}>{children}</Provider>;
};
