import React, { useEffect, useState } from 'react';
import { DrawerHeader, ItemLabel } from 'utils/styledComponents';
import Drawer from 'components/Drawer';
import theme from 'styles/theme';
import sdk from '@cognite/cdf-sdk-singleton';
import Table from 'antd/lib/table';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/shared';

interface EventsProfileProps {
  dataSetId: string | number;
  visible: boolean;
  closeDrawer(): void;
}

interface AggregateObject {
  count: number;
  value: string;
}

const AggregateColumns = (aggregate: string) => [
  {
    title: `${aggregate}`,
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: 'Number of events',
    dataIndex: 'count',
    key: 'count',
  },
];

const AGGREGATE_EVENTS_PATH = `/api/playground/projects/${sdk.project}/events/aggregate`;

const EventsProfile = (props: EventsProfileProps) => {
  const [types, setTypes] = useState<AggregateObject[]>([]);
  const [subtypes, setSubtypes] = useState<AggregateObject[]>([]);

  useEffect(() => {
    sdk
      .post(AGGREGATE_EVENTS_PATH, {
        data: {
          filter: { dataSetIds: [props.dataSetId] },
          fields: ['type'],
          aggregate: 'values',
        },
      })
      .then((res) => {
        setTypes(res.data.items);
      })
      .catch((err) =>
        handleError({ message: 'Failed to aggregate event types', ...err })
      );
    sdk
      .post(AGGREGATE_EVENTS_PATH, {
        data: {
          filter: { dataSetIds: [props.dataSetId] },
          fields: ['subtype'],
          aggregate: 'values',
        },
      })
      .then((res) => {
        setSubtypes(res.data.items);
      })
      .catch((err) =>
        handleError({ message: 'Failed to aggregate event subtypes', ...err })
      );
  }, [props.dataSetId]);

  return (
    <Drawer
      okHidden
      cancelHidden
      headerStyle={{
        background: theme.primaryBackground,
        color: 'white',
        fontSize: '16px',
      }}
      title={<DrawerHeader>Events profile </DrawerHeader>}
      width={700}
      visible={props.visible}
      onClose={() => props.closeDrawer()}
    >
      <div>
        <ItemLabel>Event types in this data set</ItemLabel>
        <Table
          rowKey="value"
          columns={AggregateColumns('Type')}
          dataSource={types}
          getPopupContainer={getContainer}
        />
        <ItemLabel>Event subtypes in this data set</ItemLabel>

        <Table
          rowKey="value"
          columns={AggregateColumns('Subtype')}
          dataSource={subtypes}
          getPopupContainer={getContainer}
        />
      </div>
    </Drawer>
  );
};

export default EventsProfile;
