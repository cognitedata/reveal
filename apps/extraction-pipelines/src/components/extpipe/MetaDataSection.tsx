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

const MetaWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
interface MetaProps {
  testId?: string;
  canEdit: boolean;
}
const META_HINT: Readonly<string> =
  'Information specific to your organization can be added using metadata fields with key/value pairs.';

export const MetaDataSection = ({
  testId = 'meta-',
  canEdit,
}: PropsWithChildren<MetaProps>) => {
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
      title="Metadata"
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
          <StyledTitle3>
            Document metadata associated with the extraction pipeline
          </StyledTitle3>
          <p>
            <Hint>{META_HINT}</Hint>
          </p>
          <EditMetaData close={closeDialog} />
        </EditModal>
      </MetaWrapper>
    </Section>
  );
};
