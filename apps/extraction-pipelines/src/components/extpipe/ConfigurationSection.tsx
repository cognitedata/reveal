import React, { useEffect, useState } from 'react';
import { useTranslation } from 'common';
import { useCreateConfigRevision, useExtpipeConfig } from 'hooks/config';
import Section from 'components/section';
import ConfigurationEditor from './ConfigurationEditor';
import CreatedTime from './CreatedTime';
import { useQueryClient } from 'react-query';
import { Body, Button, Flex, Icon, toast } from '@cognite/cogs.js';

type Props = {
  externalId: string;
};
export default function ConfigurationSection({ externalId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [newConfig, setNewConfig] = useState('');

  const { data: configuration, isLoading } = useExtpipeConfig({
    externalId,
  });

  useEffect(() => {
    if (!editMode && configuration) {
      setNewConfig(configuration.config);
    }
  }, [configuration, editMode]);

  const { mutate, isLoading: isSaving } = useCreateConfigRevision({
    onSuccess() {
      queryClient.invalidateQueries(['extpipe', 'config', externalId]);
      setEditMode(false);
    },
    onError({ message }) {
      toast.error(message, {
        toastId: 'config-create-error',
        position: 'bottom-right',
      });
    },
  });

  const created = configuration?.createdTime
    ? new Date(configuration?.createdTime)
    : undefined;

  return (
    <div>
      <Section
        title={t('configuration-file-for-extractor')}
        icon={isLoading ? 'Loader' : 'Document'}
        data-testid="configuration"
        extra={
          <Flex style={{ gap: 10 }} alignItems="center">
            {created && (
              <>
                {isSaving && <Icon type="Loader" />}
                <Body level={3}>
                  <CreatedTime prefix={t('last-updated-at')} date={created} />
                </Body>
              </>
            )}
            {created || editMode ? (
              <>
                {editMode ? (
                  <>
                    <Button size="small" onClick={() => setEditMode(!editMode)}>
                      {t('discard-changes')}
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      disabled={isSaving || configuration?.config === newConfig}
                      onClick={() => {
                        mutate({ config: newConfig, externalId });
                      }}
                    >
                      {t('publish')}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="small"
                    type="ghost"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {t('edit')}
                  </Button>
                )}
              </>
            ) : (
              <></>
            )}
          </Flex>
        }
      >
        <ConfigurationEditor
          externalId={externalId}
          editable={editMode}
          onChange={setNewConfig}
          onCreate={() => setEditMode(true)}
        />
      </Section>
    </div>
  );
}
