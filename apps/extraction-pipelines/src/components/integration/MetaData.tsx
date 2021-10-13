import React, { PropsWithChildren, useState } from 'react';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { DetailFieldNames } from 'model/Integration';
import styled from 'styled-components';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { MetaData as MetaDataModel } from 'model/MetaData';
import { MetaField } from 'components/integration/MetaDataField';
import { EditModal } from 'components/modals/EditModal';
import { EditMetaData } from 'components/inputs/metadata/EditMetaData';
import { StyledTitle2 } from 'styles/StyledHeadings';
import { Hint } from 'styles/StyledForm';
import { EditableAreaButton } from 'components/integration/EditableAreaButton';

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
  'Add metadata for the extraction pipeline in a key-value format.';

export const MetaData = ({
  testId = 'meta-',
  canEdit,
}: PropsWithChildren<MetaProps>) => {
  const [showMetaModal, setShowMetaModal] = useState(false);
  const { integration: selected } = useSelectedIntegration();
  const { data: storedIntegration } = useIntegrationById(selected?.id);

  const toggleModal = (show: boolean) => {
    return () => {
      setShowMetaModal(show);
    };
  };

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

  const meta = storedIntegration?.metadata;
  return (
    <MetaWrapper>
      {meta == null ? (
        <AddFieldValueBtn canEdit={canEdit} onClick={toggleModal(true)}>
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
        visible={showMetaModal}
        onCancel={() => setShowMetaModal(false)}
      >
        <StyledTitle2 id="edit-metadata-heading">
          {DetailFieldNames.META_DATA}
        </StyledTitle2>
        <Hint>{META_HINT}</Hint>
        <EditMetaData />
      </EditModal>
    </MetaWrapper>
  );
};
