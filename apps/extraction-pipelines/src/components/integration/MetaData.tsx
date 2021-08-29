import React, { PropsWithChildren, useState } from 'react';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { DetailFieldNames } from 'model/Integration';
import styled from 'styled-components';
import { bottomSpacing } from 'styles/StyledVariables';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { DetailHeadingEditBtn } from 'components/buttons/DetailHeadingEditBtn';
import { MetaData as MetaDataModel } from 'model/MetaData';
import { MetaField } from 'components/integration/MetaDataField';
import { EditModal } from 'components/modals/EditModal';
import { EditMetaData } from 'components/inputs/metadata/EditMetaData';
import { StyledTitle2 } from 'styles/StyledHeadings';
import { Hint } from 'styles/StyledForm';

const MetaWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  .meta-field {
    margin-left: 1rem;
    margin-bottom: ${bottomSpacing};
  }
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

  const renderMeta = (meta?: MetaDataModel) => {
    if (!meta) {
      return (
        <AddFieldValueBtn canEdit={canEdit} onClick={toggleModal(true)}>
          {DetailFieldNames.META_DATA.toLowerCase()}
        </AddFieldValueBtn>
      );
    }
    return (
      <>
        {Object.entries(meta).map(([k, v], index) => {
          return (
            <React.Fragment key={`${testId}-${k}-${v}`}>
              <MetaField
                fieldKey={k}
                fieldValue={v}
                testId={`${testId}-${index}`}
              />
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <MetaWrapper>
      <DetailHeadingEditBtn
        canEdit={canEdit}
        onClick={() => setShowMetaModal(true)}
      >
        {DetailFieldNames.META_DATA}
      </DetailHeadingEditBtn>
      {renderMeta(storedIntegration?.metadata)}
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
