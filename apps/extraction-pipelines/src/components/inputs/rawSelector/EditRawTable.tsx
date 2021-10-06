import React, { FunctionComponent, useState } from 'react';
import { DetailFieldNames, Integration } from 'model/Integration';
import { RawEditModal } from 'components/modals/RawEditModal';
import { TEST_ID_BTN_SAVE } from 'components/integration/DocumentationSection';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { DivFlex } from 'styles/flex/StyledFlex';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { EditableAreaButton } from 'components/integration/EditableAreaButton';

const RawTableWrapper = styled.div``;
export const RAW_DB: Readonly<string> = 'Raw database';
export const RAW_TABLE: Readonly<string> = 'Raw table';
const EditRawTable: FunctionComponent<{ canEdit: boolean }> = ({ canEdit }) => {
  const [showRawModal, setShowRawModal] = useState(false);
  const { integration: selected } = useSelectedIntegration();
  const { data: storedIntegration } = useIntegrationById(selected?.id);

  const toggleModal = (show: boolean) => {
    return () => {
      if (canEdit) {
        setShowRawModal(show);
      }
    };
  };

  const renderRaw = (integration?: Integration) => {
    if (!integration?.rawTables?.length) {
      return (
        <AddFieldValueBtn canEdit={canEdit} onClick={toggleModal(true)}>
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
        <EditableAreaButton
          type="ghost"
          icon="Edit"
          iconPlacement="right"
          disabled={!canEdit}
          onClick={toggleModal(true)}
          title="Toggle raw table modal"
          data-testid={`${TEST_ID_BTN_SAVE}rawTable`}
          $full
        >
          <div>
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
          </div>
        </EditableAreaButton>
      </RawTableWrapper>
    );
  };

  return (
    <>
      {renderRaw(storedIntegration)}
      <RawEditModal visible={showRawModal} onCancel={toggleModal(false)} />
    </>
  );
};
export default EditRawTable;
