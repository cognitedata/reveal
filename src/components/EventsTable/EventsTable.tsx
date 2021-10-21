import React, { useState, useEffect } from 'react';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { CogniteEvent } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { Button } from '@cognite/cogs.js';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/utils';
import { ExploreViewConfig } from '../../utils/types';
import ColumnWrapper from '../ColumnWrapper';

interface EventsPreviewProps {
  dataSetId: number;
  setExploreView(value: ExploreViewConfig): void;
}

const EventsPreview = ({ setExploreView, dataSetId }: EventsPreviewProps) => {
  const [events, setEvents] = useState<CogniteEvent[]>();

  useEffect(() => {
    sdk.events
      .list({ filter: { dataSetIds: [{ id: dataSetId }] } })
      .then((res) => {
        setEvents(res.items);
      })
      .catch((e) => {
        handleError({ message: 'Failed to fetch events', ...e });
      });
  }, [dataSetId]);

  const eventsColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Subtype',
      dataIndex: 'subtype',
      key: 'subtype',
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'Actions',
      render: (record: CogniteEvent) => (
        <span>
          <Button
            type="link"
            onClick={() =>
              setExploreView({
                type: 'event',
                id: record.id,
                visible: true,
              })
            }
          >
            Preview
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div id="#events">
      <ItemLabel>Events</ItemLabel>
      <Table
        rowKey="id"
        columns={eventsColumns}
        dataSource={events}
        pagination={{ pageSize: 5 }}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default EventsPreview;
