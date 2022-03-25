import { useEffect, useState } from 'react';
import { CogniteEvent } from '@cognite/sdk';
import * as Sentry from '@sentry/browser';
import { isProduction } from '@cognite/react-container';
import sidecar from 'utils/sidecar';

const Events = () => {
  const { powerOpsApiBaseUrl } = sidecar;
  const sourceURL = `${powerOpsApiBaseUrl}/sse`;
  const [serverEvents, setServerEvents] = useState<CogniteEvent[]>([]);

  const processEvent = (e: MessageEvent): void => {
    // TODO(POWEROPS-000) fetch CDF event data using authenticated SDK
    const data = JSON.parse(e.data);
    const event = {
      externalId: data.id,
      type: data.type,
      createdTime: data.createdTime,
    };
    if (event) {
      setServerEvents((serverEvents) => [
        ...serverEvents,
        event as CogniteEvent,
      ]);
    }
  };

  useEffect(() => {
    const eventSource = new EventSource(sourceURL, {
      withCredentials: isProduction,
    });

    eventSource.addEventListener(
      'POPS:run_shop',
      processEvent as EventListener
    );

    eventSource.onerror = (e) => {
      Sentry.captureMessage(
        'Error listening to SSE endpoint',
        Sentry.Severity.Error
      );
      Sentry.captureException(e);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const printEvent = (event: CogniteEvent) => {
    return (
      <div
        key={event.externalId}
        style={{
          display: 'block',
          padding: '10px',
          margin: '10px',
          border: 'solid 2px #999',
          boxShadow: '0 0 2px #eee',
        }}
      >
        <div>
          <strong>ExternalId: </strong>
          {event.externalId}
        </div>
        <div>
          <strong>Type: </strong>
          {event.type}
        </div>
        <div>
          <strong>Created Time: </strong>
          {event.createdTime}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <h1 style={{ marginTop: '50px' }}>CDF real-time events</h1>
      <h3>
        Listening to Power Ops API @ <code>http://localhost:8805/sse</code>
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'center',
        }}
      >
        {serverEvents?.map((event) => printEvent(event))}
      </div>
    </div>
  );
};

export default Events;
