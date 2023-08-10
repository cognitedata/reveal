import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { MQTTSourceWithJobMetrics } from '../../hooks/hostedExtractors';
import { EditSourceAuthenticationModal } from '../edit-source-authentication-modal/EditSourceAuthenticationModal';
import Section from '../section';

type SourceAuthenticationProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const SourceAuthentication = ({
  className,
  source,
}: SourceAuthenticationProps): JSX.Element => {
  const { t } = useTranslation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      {isEditModalOpen && (
        <EditSourceAuthenticationModal
          onCancel={() => setIsEditModalOpen(false)}
          source={source}
          visible={isEditModalOpen}
        />
      )}
      <Section
        className={className}
        extra={
          <Button
            onClick={() => setIsEditModalOpen(true)}
            size="small"
            type="ghost-accent"
          >
            {t('edit')}
          </Button>
        }
        icon="Credentials"
        items={[
          {
            key: 'username',
            title: t('form-username'),
            value: source.username,
          },
        ]}
        title={t('authentication')}
      />
    </>
  );
};
