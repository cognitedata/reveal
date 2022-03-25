import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { CogniteEvent } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import ColumnWrapper from '../ColumnWrapper';

interface EventsPreviewProps {
  dataSetId: number;
}

const EventsPreview = ({ dataSetId }: EventsPreviewProps) => {
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
          <Link to={createLink(`/explore/event/${record.id}`)}>View</Link>
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
        pagination={DEFAULT_ANTD_TABLE_PAGINATION}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default EventsPreview;
