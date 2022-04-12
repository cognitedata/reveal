import { useState, createContext, useEffect } from 'react';
import sidecar from 'utils/sidecar';
import { Observable } from 'rxjs';
import { SnifferEvent } from 'models/sniffer';

export interface EDAContextType {
  EDAEvents?: Observable<SnifferEvent>;
}

export const EDAContext = createContext<EDAContextType>({});

export const EventProvider: React.FC = ({ children }) => {
  const { powerOpsApiBaseUrl } = sidecar;
  const eventsSourceURL = `${powerOpsApiBaseUrl}/sse`;

  const [eventContextValue, setEventContextValue] = useState<EDAContextType>(
    {}
  );

  useEffect(() => {
    const source = new EventSource(eventsSourceURL, {
      withCredentials: false,
    });

    const observable = new Observable<SnifferEvent>((subscriber) => {
      source.onmessage = (e: MessageEvent) => {
        subscriber.next(JSON.parse(e.data));
      };
    });

    setEventContextValue({ EDAEvents: observable });

    return () => {
      source?.close();
    };
  }, []);

  const { Provider } = EDAContext;

  return <Provider value={eventContextValue}>{children}</Provider>;
};
