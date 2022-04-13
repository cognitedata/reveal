import { memo, useState, useContext, useEffect, useMemo } from 'react';
import { Button } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { CogniteClient, CogniteEvent } from '@cognite/sdk';
import { SnifferEvent } from '@cognite/power-ops-api-types';
import { EDAContext } from 'providers/edaProvider';
import { useFetchEvents } from 'queries/useFetchEvents';

import { Container } from '../elements';

import ProcessList from './ProcessList';

export type Process = {
  id?: number;
  externalId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  time: Date;
  status: string;
  event?: CogniteEvent;
};

const SHOP_PROCESS_PREFIX = 'POWEROPS_BID_PROCESS';

const ProcessWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <ProcessesPage client={client} /> : null
    }
  </AuthConsumer>
);

const ProcessesPage = ({ client }: { client: CogniteClient }) => {
  const { EDAEvents } = useContext(EDAContext);
  const [processes, setProcesses] = useState<Process[]>([]);

  const { data: events, refetch: refetchEvents } = useFetchEvents({
    client,
    processType: SHOP_PROCESS_PREFIX,
  });

  const getProcessList = async (): Promise<void> => {
    const transformedData = events?.map((row) => {
      return {
        id: row.id,
        name: row.type!,
        externalId: row.externalId!,
        startTime: '',
        endTime: '',
        time: row.createdTime,
        status: 'Fetching status',
      };
    });

    if (transformedData) setProcesses(transformedData);
  };

  const startNewProcess = async (type: string) => {
    const dataSets = await client?.datasets.retrieve([
      { externalId: 'uc:002:sandbox' },
    ]);
    const externalId = `${SHOP_PROCESS_PREFIX}_`.concat(Date.now().toString());
    await client?.events.create([
      {
        externalId,
        dataSetId: dataSets && dataSets[0].id,
        type,
        metadata: {
          'shop:watercourse': 'OE',
          'shop:starttime': '2022-02-16 00:00:00',
          'shop:endtime': '2022-02-28 00:00:00',
        },
      },
    ]);
  };

  const processEvent = async (e: SnifferEvent): Promise<void> => {
    if (!e.id) return;

    const event = (await client?.events.retrieve([{ id: e.id }]))?.[0];
    if (!event) return;

    switch (event.type) {
      case 'POWEROPS_SHOP_RUN':
        refetchEvents();
        break;
    }
  };

  const updateProcess = (externalId: string, newData: Process) => {
    setProcesses(
      processes.map((p) => {
        if (p.externalId === externalId) {
          return newData;
        }
        return p;
      })
    );
  };

  useEffect(() => {
    const subscription = EDAEvents?.subscribe((event) => {
      processEvent(event);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [processEvent]);

  useEffect(() => {
    if (events) {
      getProcessList();
    }
  }, [events]);

  return (
    <Container
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <Button
        type="primary"
        onClick={() => startNewProcess('POWEROPS_SHOP_RUN')}
      >
        Run SHOP
      </Button>
      <ProcessList
        client={client}
        processes={useMemo(() => processes, [processes])}
        updateProcess={updateProcess}
      />
    </Container>
  );
};

export const Processes = memo(ProcessWrapper);
