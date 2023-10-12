import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { MQTTSourceWithJobMetrics } from '../../hooks/hostedExtractors';
import { MQTT_SOURCE_TYPE_LABEL } from '../create-source-modal/CreateSourceModal';
import { EditSourceDetailsModal } from '../edit-source-details-modal/EditSourceDetailsModal';
import Section from '../section';

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
      {isEditModalOpen && (
        <EditSourceDetailsModal
          onCancel={() => setIsEditModalOpen(false)}
          source={source}
          visible={isEditModalOpen}
        />
      )}
      <Section
        className={className}
        extra={
          <Button
            type="ghost-accent"
            onClick={() => setIsEditModalOpen(true)}
            size="small"
          >
            {t('edit')}
          </Button>
        }
        icon="Info"
        items={[
          {
            key: 'externalId',
            title: t('form-source-external-id'),
            value: source.externalId,
          },
          {
            key: 'host',
            title: t('form-host-name'),
            value: source.host,
          },
          {
            key: 'protocol',
            title: t('form-protocol-version'),
            value: MQTT_SOURCE_TYPE_LABEL[source.type],
          },
          { key: 'port', title: t('form-port'), value: source.port },
          {
            key: 'useTls',
            title: t('use-tls'),
            value: source.useTls ? t('true') : t('false'),
          },
        ]}
        title={t('source-details')}
      />
    </>
  );
};
