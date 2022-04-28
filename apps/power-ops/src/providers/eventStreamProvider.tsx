import { useState, createContext, useEffect } from 'react';
import sidecar from 'utils/sidecar';
import { Observable } from 'rxjs';
import { SnifferEvent } from '@cognite/power-ops-api-types';

export interface EventStreamContextType {
  eventStore?: Observable<SnifferEvent>;
}

export const EventStreamContext = createContext<EventStreamContextType>({});

export const EventStreamProvider: React.FC = ({ children }) => {
  const { powerOpsApiBaseUrl } = sidecar;
  const eventsSourceURL = `${powerOpsApiBaseUrl}/sse`;

  const [eventContextValue, setEventContextValue] =
    useState<EventStreamContextType>({});

  useEffect(() => {
    const source = new EventSource(eventsSourceURL, {
      withCredentials: false,
    });

    const observable = new Observable<SnifferEvent>((subscriber) => {
      source.onmessage = (e: MessageEvent) => {
        subscriber.next(JSON.parse(e.data));
      };
    });

    setEventContextValue({ eventStore: observable });

    return () => {
      source?.close();
    };
  }, []);

  const { Provider } = EventStreamContext;

  return <Provider value={eventContextValue}>{children}</Provider>;
};
