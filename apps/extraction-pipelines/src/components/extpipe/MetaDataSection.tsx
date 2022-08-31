import React, { PropsWithChildren, useState } from 'react';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { DetailFieldNames } from 'model/Extpipe';
import styled from 'styled-components';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { MetaData as MetaDataModel } from 'model/MetaData';
import { MetaField } from 'components/extpipe/MetaDataField';
import { EditModal } from 'components/modals/EditModal';
import { EditMetaData } from 'components/inputs/metadata/EditMetaData';
import { Hint } from 'components/styled';
import { StyledTitle3 } from 'components/styled';
import { Section } from 'components/extpipe/Section';
import { Column } from 'components/extpipe/ContactsSection';
import { useTranslation } from 'common';

interface MetaProps {
  testId?: string;
  canEdit: boolean;
}

export const MetaDataSection = ({
  testId = 'meta-',
  canEdit,
}: PropsWithChildren<MetaProps>) => {
  const { t } = useTranslation();
  const [showMetaModal, setShowMetaModal] = useState(false);
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: storedExtpipe } = useExtpipeById(selected?.id);

  const renderMeta = (meta: MetaDataModel) => {
    return (
      <Column>
        {Object.entries(meta).map(([k, v], index) => {
          return (
            <MetaField
              key={`${testId}-${k}-${v}`}
              fieldKey={k}
              fieldValue={v}
              testId={`${testId}-${index}`}
            />
          );
        })}
      </Column>
    );
  };

  const meta = storedExtpipe?.metadata;
  const closeDialog = () => setShowMetaModal(false);
  const openDialog = () => setShowMetaModal(true);
  return (
    <Section
      title={t('meta-data')}
      icon="DataTable"
      editButton={{ onClick: openDialog, canEdit }}
    >
      <MetaWrapper>
        {meta == null ? (
          <AddFieldValueBtn canEdit={canEdit} onClick={openDialog}>
            {DetailFieldNames.META_DATA.toLowerCase()}
          </AddFieldValueBtn>
        ) : (
          <div css="padding: 0 1rem">{renderMeta(meta)}</div>
        )}
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
      </MetaWrapper>
    </Section>
  );
};

const MetaWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
