import { useEffect, useState } from 'react';

import Table from 'antd/lib/table';

import sdk from '@cognite/cdf-sdk-singleton';

import { useTranslation } from '../../common/i18n';
import { getContainer, handleError, ItemLabel } from '../../utils';
import Drawer from '../Drawer';

interface EventsProfileProps {
  dataSetId: string | number;
  visible: boolean;
  closeDrawer(): void;
}

interface AggregateObject {
  count: number;
  value: string;
}

const AGGREGATE_EVENTS_PATH = `/api/v1/projects/${sdk.project}/events/aggregate`;

const EventsProfile = (props: EventsProfileProps) => {
  const { t } = useTranslation();
  const [types, setTypes] = useState<AggregateObject[]>([]);
  const [subtypes, setSubtypes] = useState<AggregateObject[]>([]);

  const AggregateColumns = (aggregate: string) => [
    {
      title: `${aggregate}`,
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: t('number-of-events'),
      dataIndex: 'count',
      key: 'count',
    },
  ];

  useEffect(() => {
    sdk
      .post(AGGREGATE_EVENTS_PATH, {
        data: {
          filter: { dataSetIds: [{ id: props.dataSetId }] },
          fields: ['type'],
          aggregate: 'values',
        },
      })
      .then((res) => {
        setTypes(res.data.items);
      })
      .catch((err) =>
        handleError({ message: t('events-profile-failed-event-types'), ...err })
      );
    sdk
      .post(AGGREGATE_EVENTS_PATH, {
        data: {
          filter: { dataSetIds: [{ id: props.dataSetId }] },
          fields: ['subtype'],
          aggregate: 'values',
        },
      })
      .then((res) => {
        setSubtypes(res.data.items);
      })
      .catch((err) =>
        handleError({
          message: t('events-profile-failed-event-subtypes'),
          ...err,
        })
      );
  }, [props.dataSetId, t]);

  return (
    <Drawer
      okHidden
      cancelHidden
      width={700}
      visible={props.visible}
      onClose={() => props.closeDrawer()}
    >
      <div>
        <ItemLabel>{t('events-profile-types')}</ItemLabel>
        <Table
          rowKey="value"
          columns={AggregateColumns(t('type'))}
          dataSource={types}
          getPopupContainer={getContainer}
        />
        <ItemLabel>{t('events-profile-subtypes')}</ItemLabel>

        <Table
          rowKey="value"
          columns={AggregateColumns(t('subtype'))}
          dataSource={subtypes}
          getPopupContainer={getContainer}
        />
      </div>
    </Drawer>
  );
};

export default EventsProfile;
