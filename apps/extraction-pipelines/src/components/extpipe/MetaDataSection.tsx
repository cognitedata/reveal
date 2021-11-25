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
import { Hint } from 'styles/StyledForm';
import { EditableAreaButton } from 'components/extpipe/EditableAreaButton';
import { StyledTitle3 } from 'styles/StyledHeadings';
import { Section } from 'components/extpipe/Section';

const MetaWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const RowsWithGaps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
      <RowsWithGaps>
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
      </RowsWithGaps>
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
          <EditableAreaButton
            disabled={!canEdit}
            onClick={() => canEdit && setShowMetaModal(true)}
            $full
          >
            <div>{renderMeta(meta)}</div>
          </EditableAreaButton>
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
