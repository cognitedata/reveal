import { memo, useState, useContext, useEffect } from 'react';
import { Button } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { CogniteEvent } from '@cognite/sdk';
import { EDAContext } from 'providers/EDAProvider';

import { TableData } from '../../models/sequences';
import { Container } from '../elements';
import { SnifferEvent } from '../../models/sniffer';

import ProcessList from './ProcessList';
// import BidMatrix from './BidMatrix';

export type Process = {
  id?: number;
  externalId: string;
  name: string;
  description: string;
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
  const { client } = useAuthContext();
  const { EDAEvents } = useContext(EDAContext);
  const [processes, setProcesses] = useState<Process[]>([]);

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
        id: event?.[0].id,
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

  const processEvent = async (event: SnifferEvent): Promise<void> => {
    if (!event.id || !event.type) return;

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

    setProcesses((previousProcesses) => {
      const newProcesses = previousProcesses.map((p) =>
        p.externalId === sourceEvent?.[0].externalId
          ? { ...p, status: shopStatuses?.[event.type] }
          : p
      );
      return [...newProcesses];
    });
    // switch (event.type) {
    //   case 'POWEROPS_BID_MATRIX_END':
    //     getBidMatrix(event.id);
    //     break;
    // }
  };

  useEffect(() => {
    const subscription = EDAEvents?.subscribe((event) => {
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
      <Button type="primary" onClick={() => runShop()}>
        Run SHOP
      </Button>
      <ProcessList processes={processes} />
    </Container>
  );
};

export default memo(Demo);
