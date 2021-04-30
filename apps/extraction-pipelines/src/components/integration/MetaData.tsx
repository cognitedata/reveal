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
}

export const MetaData = ({
  testId = 'meta-',
}: PropsWithChildren<MetaProps>) => {
  const [, setShowMetaModal] = useState(false);
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
        <AddFieldValueBtn onClick={toggleModal(true)}>
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
      <DetailHeadingEditBtn onClick={toggleModal(true)}>
        {DetailFieldNames.META_DATA}
      </DetailHeadingEditBtn>
      {renderMeta(storedIntegration?.metadata)}
    </MetaWrapper>
  );
};
