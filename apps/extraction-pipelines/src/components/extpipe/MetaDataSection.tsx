import React, { PropsWithChildren, useState } from 'react';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { DetailFieldNames } from 'model/Extpipe';
import { EditModal } from 'components/modals/EditModal';
import { EditMetaData } from 'components/inputs/metadata/EditMetaData';
import { Hint } from 'components/styled';
import { StyledTitle3 } from 'components/styled';
import Section from 'components/section';
import { useTranslation } from 'common';
import { Button } from '@cognite/cogs.js';
import { uppercaseFirstWord } from 'utils/primitivesUtils';

interface MetaProps {
  testId?: string;
  canEdit: boolean;
}

export const MetaDataSection = ({ canEdit }: PropsWithChildren<MetaProps>) => {
  const { t } = useTranslation();
  const [showMetaModal, setShowMetaModal] = useState(false);
  const { data: storedExtpipe } = useSelectedExtpipe();

  const meta = storedExtpipe?.metadata;
  const closeDialog = () => setShowMetaModal(false);
  const openDialog = () => setShowMetaModal(true);
  return (
    <>
      <EditModal
        title={DetailFieldNames.META_DATA}
        visible={showMetaModal}
        close={closeDialog}
      >
        <StyledTitle3>{t('meta-data-title')}</StyledTitle3>
        <p>
          <Hint>{t('meta-data-hint')}</Hint>
        </p>
        <EditMetaData close={closeDialog} />
      </EditModal>
      <Section
        extra={
          <Button
            disabled={!canEdit}
            onClick={openDialog}
            size="small"
            type="ghost"
          >
            Edit
          </Button>
        }
        title={t('meta-data')}
        icon="DataTable"
        items={
          meta && Object.keys(meta)?.length !== 0
            ? Object.entries(meta).map(([key, value]) => ({
                key,
                title: uppercaseFirstWord(key),
                value,
              }))
            : [
                {
                  key: 'metadata',
                  value: t('no-metadata-added'),
                },
              ]
        }
      />
    </>
  );
};
