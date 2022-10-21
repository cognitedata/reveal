import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { CogniteEvent } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import handleError from 'utils/handleError';
import { getContainer } from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import ColumnWrapper from '../ColumnWrapper';
import { useTranslation } from 'common/i18n';
import { useSearchResource } from 'hooks/useSearchResource';

interface EventsPreviewProps {
  dataSetId: number;
  query: string;
}

const EventsPreview = ({ dataSetId, query }: EventsPreviewProps) => {
  const { t } = useTranslation();

  const { data: events } = useSearchResource('events', dataSetId, query, {
    onError: (e: any) => {
      handleError({ message: t('fetch-events-failed'), ...e });
    },
  });

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

  return (
    <div id="#events">
      <ItemLabel>{t('events')}</ItemLabel>
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
