import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from 'antd/lib/table';
import { CogniteEvent } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import ColumnWrapper from '../ColumnWrapper';
import { useTranslation } from 'common/i18n';
import { ExploreViewConfig } from 'utils';
import { Flex, Button } from '@cognite/cogs.js';

interface EventsPreviewProps {
  dataSetId: number;
  setExploreView?: (value: ExploreViewConfig) => void;
}

const EventsPreview = ({ dataSetId, setExploreView }: EventsPreviewProps) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<CogniteEvent[]>();

  useEffect(() => {
    sdk.events
      .list({ filter: { dataSetIds: [{ id: dataSetId }] } })
      .then((res) => {
        setEvents(res.items);
      })
      .catch((e) => {
        handleError({ message: t('fetch-events-failed'), ...e });
      });
  }, [dataSetId, t]);

  const eventsColumns = [
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('subtype'),
      dataIndex: 'subtype',
      key: 'subtype',
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('action_other'),
      render: (record: CogniteEvent) => (
        <span>
          <Link to={createLink(`/explore/event/${record.id}`)}>
            {t('view')}
          </Link>
        </span>
      ),
    },
  ];

  const handleViewEvents = () => {
    if (setExploreView && dataSetId) {
      setExploreView({
        visible: true,
        type: 'events-profile',
        id: dataSetId,
      });
    }
  };

  return (
    <div id="#events">
      <Flex justifyContent="flex-end" style={{ padding: '12px 0' }}>
        <Button type="secondary" size="small" onClick={handleViewEvents}>
          {`${t('view')} ${t('events').toLocaleLowerCase()}`}
        </Button>
      </Flex>
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
