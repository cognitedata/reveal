import React, { FunctionComponent, useState } from 'react';
import { DetailFieldNames, Integration } from 'model/Integration';
import { RawEditModal } from 'components/modals/RawEditModal';
import { EditButton } from 'styles/StyledButton';
import { TEST_ID_BTN_SAVE } from 'components/integration/DocumentationSection';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { DivFlex } from 'styles/flex/StyledFlex';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { StyledLabel } from 'styles/StyledForm';
import { bottomSpacing } from 'styles/StyledVariables';
import { createLink } from '@cognite/cdf-utilities';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';

const RawLabel = styled(StyledLabel)`
  color: ${Colors['text-color'].hex()};
  display: flex;
`;
const RawTableWrapper = styled.div`
  margin-left: 1rem;
  margin-bottom: ${bottomSpacing};
`;
export const RAW_DB: Readonly<string> = 'Raw database';
export const RAW_TABLE: Readonly<string> = 'Raw table';
const EditRawTable: FunctionComponent = () => {
  const [showRawModal, setShowRawModal] = useState(false);
  const { integration: selected } = useSelectedIntegration();
  const { data: storedIntegration } = useIntegrationById(selected?.id);

  const toggleModal = (show: boolean) => {
    return () => {
      setShowRawModal(show);
    };
  };

  const renderRaw = (integration?: Integration) => {
    if (!integration?.rawTables?.length) {
      return (
        <AddFieldValueBtn onClick={toggleModal(true)}>
          {DetailFieldNames.RAW_TABLE.toLowerCase()}
        </AddFieldValueBtn>
      );
    }
    return (
      <RawTableWrapper
        id="raw-table-grid"
        role="grid"
        aria-labelledby="raw-table-label"
      >
        {integration.rawTables.map(({ dbName, tableName }) => {
          return (
            <DivFlex role="row" key={`${dbName}-${tableName}`}>
              <a
                role="gridcell"
                href={createLink(`/raw/${dbName}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dbName}
              </a>
              <Icon type="Dot" aria-hidden />
              <a
                role="gridcell"
                data-testid="selected-table"
                href={createLink(`/raw/${dbName}/${tableName}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tableName}
              </a>
            </DivFlex>
          );
        })}
      </RawTableWrapper>
    );
  };

  return (
    <>
      <EditButton
        onClick={toggleModal(true)}
        title="Toggle raw table modal"
        data-testid={`${TEST_ID_BTN_SAVE}rawTable`}
        $full
      >
        <RawLabel id="raw-table-label" htmlFor="raw-table-grid">
          <span>{RAW_DB}</span>
          <Icon type="Dot" aria-hidden />
          <span>{RAW_TABLE}</span>
        </RawLabel>
      </EditButton>
      {renderRaw(storedIntegration)}
      <RawEditModal visible={showRawModal} onCancel={toggleModal(false)} />
    </>
  );
};
export default EditRawTable;
