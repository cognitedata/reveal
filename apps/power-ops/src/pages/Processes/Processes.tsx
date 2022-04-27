import { memo, useContext, useEffect, useMemo } from 'react';
import { Flex, Button } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient, CogniteEvent } from '@cognite/sdk';
import { SnifferEvent } from '@cognite/power-ops-api-types';
import { EDAContext } from 'providers/edaProvider';
import { useFetchProcesses } from 'queries/useFetchProcesses';

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

const PROCESS_PREFIX = 'POWEROPS_BID_PROCESS';

const ProcessWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client, authState }: AuthContext) =>
      client ? <ProcessesPage client={client} authState={authState} /> : null
    }
  </AuthConsumer>
);

const ProcessesPage = ({
  client,
  authState,
}: {
  client: CogniteClient;
  authState: AuthenticatedUser | undefined;
}) => {
  const { EDAEvents } = useContext(EDAContext);

  const { data: processes, refetch: refetchProcesses } = useFetchProcesses({
    project: client.project,
    processTypes: [
      'POWEROPS_BID_PROCESS',
      'POWEROPS_SHOP_RUN',
      'POWEROPS_FUNCTIONAL_CALL',
    ],
    token: authState?.token,
  });

  const startNewProcess = async (type: string) => {
    const dataSets = await client?.datasets.retrieve([
      { externalId: 'uc:002:sandbox' },
    ]);
    const externalId = `${PROCESS_PREFIX}_`.concat(Date.now().toString());
    const mappingExternalId1 =
      'SHOP_OE_incremental_mapping_scenario_1_1650887409000';
    const mappingExternalId2 =
      'SHOP_OE_incremental_mapping_scenario_2_1650887409000';
    const matrixConfigId = 'SHOP_OE_bid_matrix_generator_config';

    await client?.relationships.create([
      {
        externalId: `${externalId}.${mappingExternalId1}`,
        sourceExternalId: externalId,
        sourceType: 'event',
        targetExternalId: mappingExternalId1,
        targetType: 'sequence',
        dataSetId: dataSets[0].id,
        labels: [
          { externalId: 'relationship_to.incremental_mapping_sequence' },
        ],
      },
    ]);
    await client?.relationships.create([
      {
        externalId: `${externalId}.${mappingExternalId2}`,
        sourceExternalId: externalId,
        sourceType: 'event',
        targetExternalId: mappingExternalId2,
        targetType: 'sequence',
        dataSetId: dataSets[0].id,
        labels: [
          { externalId: 'relationship_to.incremental_mapping_sequence' },
        ],
      },
    ]);
    await client?.relationships.create([
      {
        externalId: `${externalId}.${matrixConfigId}`,
        sourceExternalId: externalId,
        sourceType: 'event',
        targetExternalId: matrixConfigId,
        targetType: 'sequence',
        dataSetId: dataSets[0].id,
        labels: [
          {
            externalId: 'relationship_to.bid_matrix_generator_config_sequence',
          },
        ],
      },
    ]);
    await client?.events.create([
      {
        externalId,
        dataSetId: dataSets[0].id,
        type,
        metadata: {
          'bid:date': '2022-04-26',
          'bid:bid_matrix_generator_config_external_id':
            'SHOP_OE_bid_matrix_generator_config',
          'shop:starttime': '2022-04-25 22:00:00',
          'shop:endtime': '2022-05-08 00:00:00',
          'shop:watercourse': 'OE',
          'shop:incremental_mapping_external_ids': `[${mappingExternalId1},${mappingExternalId2}]`,
          'bid:main_scenario_incremental_mapping_external_id':
            mappingExternalId1,
        },
      },
    ]);
  };

  const processEvent = async (e: SnifferEvent): Promise<void> => {
    if (!e.id) return;

    const event = (await client?.events.retrieve([{ id: e.id }]))?.[0];
    if (!event) return;

    switch (event.type) {
      case 'POWEROPS_BID_PROCESS':
      case 'POWEROPS_SHOP_RUN':
      case 'POWEROPS_FUNCTIONAL_CALL':
      case 'POWEROPS_PROCESS_FAILED':
      case 'POWEROPS_PROCESS_FINISHED':
        refetchProcesses();
        break;
    }
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
    <>
      <Flex>
        <Button type="primary" onClick={() => startNewProcess(PROCESS_PREFIX)}>
          New Bid Process
        </Button>
      </Flex>
      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyItems: 'start',
        }}
      >
        <ProcessList processes={useMemo(() => processes, [processes])} />
      </Container>
    </>
  );
};

export const Processes = memo(ProcessWrapper);
