import { memo, useEffect, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { CogniteEvent } from '@cognite/sdk';
import sidecar from 'utils/sidecar';

import { TableData } from '../../models/sequences';
import { SnifferEvent } from '../../models/sniffer';
import { Container } from '../elements';

import ProcessList from './ProcessList';
// import BidMatrix from './BidMatrix';

export type Process = {
  id: number;
  name: string;
  description: string;
  externalId: string;
  startTime: string;
  endTime: string;
  time: Date;
  status: string;
  bidmatrix?: {
    columns: any;
    dataSource: TableData[];
  };
  event?: CogniteEvent;
};

const shopStatuses: Record<string, string> = {
  POWEROPS_SHOP_START: 'SHOP Started',
  POWEROPS_SHOP_END: 'SHOP Finished',
  POWEROPS_BID_MATRIX_CREATE: 'Creating Bid Matrix',
  POWEROPS_BID_MATRIX_END: 'Bid Matrix Ready',
};

const Demo = () => {
  const { powerOpsApiBaseUrl } = sidecar;
  const eventsSourceURL = `${powerOpsApiBaseUrl}/sse`;

  const { client } = useAuthContext();

  const [processes, setProcesses] = useState<Process[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | undefined>();

  if (EventSource && !eventSource) {
    const source = new EventSource(eventsSourceURL, {
      withCredentials: false,
    });
    setEventSource(source);
  }

  const runShop = async () => {
    const dataSets = await client?.datasets.retrieve([
      { externalId: 'shop_experimental' },
    ]);
    const externalId = 'POWEROPS_SHOP_RUN_'.concat(Date.now().toString());
    const event = await client?.events.create([
      {
        externalId,
        dataSetId: dataSets && dataSets[0].id,
        type: 'POWEROPS_SHOP_RUN',
        description: 'SHOP model run',
        // metadata: {
        //     shop:watercourse : "<watercourse selected by user>",
        //     shop:starttime: "<starttime set by user>",
        //     shop:endtime: "<endtime set by user>",
        // }
      },
    ]);
    setProcesses([
      ...processes,
      {
        id: 10,
        name: 'OE: SHOP Run',
        description: '',
        externalId,
        startTime: 'Feb 16th 2022',
        endTime: 'Feb 27th 2022',
        time: new Date(),
        status: 'Setting Up Environment',
        event: event?.[0],
      },
    ]);
  };

  const processEvent = async (e: MessageEvent): Promise<void> => {
    if (!e.data) return;

    const event = JSON.parse(e.data) as SnifferEvent;
    if (!event.id || !event.type) return;

    const wholeEvent = await client?.events.retrieve([
      { externalId: event.id },
    ]);
    if (!wholeEvent) return;

    const relationships = await client?.relationships.list({
      filter: {
        targetExternalIds: [event.id],
        sourceTypes: ['event'],
      },
      limit: 1,
    });
    if (!relationships?.items?.[0]) return;

    const sourceEvent = await client?.events.retrieve([
      { externalId: relationships?.items?.[0].sourceExternalId },
    ]);
    if (!sourceEvent?.[0]) return;

    updateProcess(sourceEvent?.[0], shopStatuses[event.type]);
    // switch (event.type) {
    //   case 'POWEROPS_BID_MATRIX_END':
    //     getBidMatrix(event.id);
    //     break;
    // }
  };

  const updateProcess = (sourceEvent: CogniteEvent, status: string) => {
    const newProcesses = processes.map((p) => {
      return p.externalId === sourceEvent.externalId ? { ...p, status } : p;
    });
    setProcesses([...newProcesses]);
  };

  useEffect(() => {
    [
      'POWEROPS_SHOP_START',
      'POWEROPS_SHOP_END',
      'POWEROPS_BID_MATRIX_CREATE',
      'POWEROPS_BID_MATRIX_END',
    ].forEach((type) => {
      eventSource?.addEventListener(type, (e) =>
        processEvent(e as MessageEvent)
      );
    });
    return () => {
      eventSource?.close();
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
      <Button type="primary" onClick={() => runShop()}>
        Run SHOP
      </Button>
      <ProcessList processes={processes} />
    </Container>
  );
};

export default memo(Demo);
