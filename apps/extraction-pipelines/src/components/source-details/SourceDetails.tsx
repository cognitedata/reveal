import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import Section from 'components/section';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';
import { Timestamp } from '@cognite/cdf-utilities';
import { EditSourceDetailsModal } from 'components/edit-source-details-modal/EditSourceModal';
import { MQTT_SOURCE_TYPE_LABEL } from 'components/create-source-modal/CreateSourceModal';

type SourceDetailsProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const SourceDetails = ({
  className,
  source,
}: SourceDetailsProps): JSX.Element => {
  const { t } = useTranslation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <EditSourceDetailsModal
        onCancel={() => setIsEditModalOpen(false)}
        source={source}
        visible={isEditModalOpen}
      />
      <Section
        className={className}
        extra={
          <Button
            onClick={() => setIsEditModalOpen(true)}
            size="small"
            type="ghost"
          >
            {t('edit')}
          </Button>
        }
        icon="Info"
        items={[
          {
            key: 'externalId',
            title: t('external-id'),
            value: source.externalId,
          },
          {
            key: 'username',
            title: t('form-username'),
            value: source.username,
          },
          {
            key: 'host',
            title: t('form-host-name'),
            value: source.host,
          },
          { key: 'port', title: t('form-port'), value: source.port },
          {
            key: 'throughput',
            title: t('throughput'),
            value: t('datapoints-per-hour', {
              count: source.throughput,
            }),
          },
          {
            key: 'protocol',
            title: t('form-protocol-version'),
            value: MQTT_SOURCE_TYPE_LABEL[source.type],
          },
          {
            key: 'createdTime',
            title: t('created-time'),
            value: <Timestamp timestamp={source.createdTime} />,
          },
          {
            key: 'lastUpdatedTime',
            title: t('last-modified'),
            value: <Timestamp timestamp={source.lastUpdatedTime} />,
          },
        ]}
        title={t('details')}
      />
    </>
  );
};
