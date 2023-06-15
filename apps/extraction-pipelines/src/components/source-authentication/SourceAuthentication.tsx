import React, { useState } from 'react';

import { useTranslation } from '@extraction-pipelines/common';
import { EditSourceAuthenticationModal } from '@extraction-pipelines/components/edit-source-authentication-modal/EditSourceAuthenticationModal';
import Section from '@extraction-pipelines/components/section';
import { MQTTSourceWithJobMetrics } from '@extraction-pipelines/hooks/hostedExtractors';

import { Button } from '@cognite/cogs.js';

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
            type="ghost"
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
