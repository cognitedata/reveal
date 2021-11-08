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
import { Hint } from 'styles/StyledForm';
import { EditableAreaButton } from 'components/integration/EditableAreaButton';
import { StyledTitle3 } from 'styles/StyledHeadings';

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
  const closeDialog = () => setShowMetaModal(false);
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
  );
};
